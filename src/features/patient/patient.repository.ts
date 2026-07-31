import { db } from "@/shared/lib/prisma";
import type {
  ClinicalEvaluationFormInput,
  PatientFormInput,
  SessionFormInput,
  UpdatePatientInput,
} from "./patient.schema";
import type { PatientStatus } from "./patient.types";
import { parseBirthDateParam } from "./_lib/mappers";

const memberAuthorInclude = {
  member: {
    select: {
      id: true,
      metadata: true,
      registration: true,
      user: { select: { name: true } },
    },
  },
} as const;

const guardianSelect = {
  id: true,
  name: true,
  phone: true,
  email: true,
  cpf: true,
  address: true,
  zipCode: true,
  documentImageUrl: true,
  insurance: true,
  motherName: true,
  motherCpf: true,
  fatherName: true,
  fatherCpf: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const patientRepository = {
  async findMany(
    organizationId: string,
    opts?: { status?: PatientStatus | null; search?: string },
  ) {
    return db.patient.findMany({
      where: {
        organizationId,
        ...(opts?.status ? { status: opts.status } : {}),
        ...(opts?.search ? { name: { contains: opts.search } } : {}),
      },
      include: {
        guardian: { select: guardianSelect },
        _count: {
          select: { clinicalEvaluations: true, sessionNotes: true },
        },
        clinicalEvaluations: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
      orderBy: { name: "asc" },
    });
  },

  async findById(organizationId: string, id: string) {
    return db.patient.findFirst({
      where: { id, organizationId },
      include: {
        guardian: { select: guardianSelect },
        clinicalEvaluations: {
          include: memberAuthorInclude,
          orderBy: { date: "desc" },
        },
        sessionNotes: {
          include: memberAuthorInclude,
          orderBy: [{ date: "desc" }, { time: "desc" }],
        },
        appointments: {
          include: {
            member: {
              select: { user: { select: { name: true } } },
            },
            sessionNote: { select: { id: true } },
          },
          orderBy: [{ date: "desc" }, { time: "desc" }],
        },
        roteiroNotes: true,
      },
    });
  },

  async create(organizationId: string, data: PatientFormInput) {
    const guardian = await db.guardian.findFirst({
      where: { id: data.guardianId, organizationId },
      select: { id: true },
    });
    if (!guardian) return null;

    return db.patient.create({
      data: {
        organizationId,
        guardianId: data.guardianId,
        name: data.name,
        birthDate: parseBirthDateParam(data.birthDate),
        sex: data.sex ?? "not_informed",
        photoUrl: data.photoUrl ?? null,
        notes: data.notes ?? "",
        pricingType: data.pricingType ?? "session",
        price: data.price ?? null,
      },
      include: { guardian: { select: guardianSelect } },
    });
  },

  async update(
    organizationId: string,
    id: string,
    data: Omit<UpdatePatientInput, "id">,
  ) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!existing) return null;

    const guardian = await db.guardian.findFirst({
      where: { id: data.guardianId, organizationId },
      select: { id: true },
    });
    if (!guardian) return null;

    return db.patient.update({
      where: { id },
      data: {
        guardianId: data.guardianId,
        name: data.name,
        birthDate: parseBirthDateParam(data.birthDate),
        sex: data.sex ?? "not_informed",
        photoUrl: data.photoUrl ?? null,
        notes: data.notes ?? "",
        pricingType: data.pricingType ?? "session",
        price: data.price ?? null,
      },
      include: { guardian: { select: guardianSelect } },
    });
  },

  async updateStatus(
    organizationId: string,
    id: string,
    status: PatientStatus,
  ) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    return db.patient.update({
      where: { id },
      data: { status },
      include: { guardian: { select: guardianSelect } },
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
      include: { guardian: { select: guardianSelect } },
    });
    if (!existing) return null;
    await db.patient.delete({ where: { id } });
    return existing;
  },

  async findMemberByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: { organizationId, userId },
      select: { id: true },
    });
  },

  async createClinicalEvaluation(
    organizationId: string,
    data: ClinicalEvaluationFormInput,
    memberId: string | null,
  ) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;
    const { patientId, domains, ...rest } = data;
    return db.clinicalEvaluation.create({
      data: {
        patientId,
        memberId,
        ...rest,
        domains: JSON.stringify(domains),
      },
      include: memberAuthorInclude,
    });
  },

  async updateClinicalEvaluation(
    organizationId: string,
    id: string,
    data: ClinicalEvaluationFormInput,
  ) {
    const existing = await db.clinicalEvaluation.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    const { patientId, domains, ...rest } = data;
    return db.clinicalEvaluation.update({
      where: { id },
      data: {
        patientId,
        ...rest,
        domains: JSON.stringify(domains),
      },
      include: memberAuthorInclude,
    });
  },

  async deleteClinicalEvaluation(organizationId: string, id: string) {
    const existing = await db.clinicalEvaluation.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    await db.clinicalEvaluation.delete({ where: { id } });
    return existing;
  },

  async createSession(
    organizationId: string,
    data: SessionFormInput,
    memberId: string | null,
  ) {
    const appointment = await db.appointment.findFirst({
      where: {
        id: data.appointmentId,
        patientId: data.patientId,
        organizationId,
        sessionNote: null,
      },
    });
    if (!appointment) return null;

    return db.sessionNote.create({
      data: {
        patientId: data.patientId,
        appointmentId: appointment.id,
        memberId: memberId ?? appointment.memberId,
        date: appointment.date,
        time: appointment.time,
        status: data.status,
        activities: data.activities ?? "",
        observations: data.observations ?? "",
      },
      include: memberAuthorInclude,
    });
  },

  async updateSession(
    organizationId: string,
    id: string,
    data: SessionFormInput,
  ) {
    const existing = await db.sessionNote.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;

    const appointment = await db.appointment.findFirst({
      where: {
        id: data.appointmentId,
        patientId: data.patientId,
        organizationId,
        OR: [{ sessionNote: null }, { sessionNote: { id } }],
      },
    });
    if (!appointment) return null;

    return db.sessionNote.update({
      where: { id },
      data: {
        appointmentId: appointment.id,
        date: appointment.date,
        time: appointment.time,
        status: data.status,
        activities: data.activities ?? "",
        observations: data.observations ?? "",
      },
      include: memberAuthorInclude,
    });
  },

  async deleteSession(organizationId: string, id: string) {
    const existing = await db.sessionNote.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    await db.sessionNote.delete({ where: { id } });
    return existing;
  },

  async listRoteiroNotes(organizationId: string, patientId: string) {
    const patient = await db.patient.findFirst({
      where: { id: patientId, organizationId },
    });
    if (!patient) return null;
    return db.roteiroNote.findMany({
      where: { patientId },
      orderBy: { updatedAt: "desc" },
    });
  },

  async upsertRoteiroNote(
    organizationId: string,
    data: {
      patientId: string;
      roteiroId: string;
      categoryTick: string;
      notes: string;
    },
  ) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;
    return db.roteiroNote.upsert({
      where: {
        patientId_roteiroId_categoryTick: {
          patientId: data.patientId,
          roteiroId: data.roteiroId,
          categoryTick: data.categoryTick,
        },
      },
      create: {
        patientId: data.patientId,
        roteiroId: data.roteiroId,
        categoryTick: data.categoryTick,
        notes: data.notes,
      },
      update: { notes: data.notes },
    });
  },
};
