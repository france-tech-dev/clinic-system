import { db } from "@/shared/lib/prisma";
import type {
  EvaluationFormInput,
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
      registro: true,
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
          select: { evaluations: true, sessionNotes: true },
        },
        evaluations: {
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
        evaluations: {
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
        sex: data.sex ?? "nao_informado",
        photoUrl: data.photoUrl ?? null,
        notes: data.notes ?? "",
        pricingType: data.pricingType ?? "sessao",
        priceCents: data.priceCents ?? null,
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
        sex: data.sex ?? "nao_informado",
        photoUrl: data.photoUrl ?? null,
        notes: data.notes ?? "",
        pricingType: data.pricingType ?? "sessao",
        priceCents: data.priceCents ?? null,
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

  async createEvaluation(
    organizationId: string,
    data: EvaluationFormInput,
    memberId: string | null,
  ) {
    const patient = await db.patient.findFirst({
      where: { id: data.patientId, organizationId },
    });
    if (!patient) return null;
    const { patientId, domains, ...rest } = data;
    return db.evaluation.create({
      data: {
        patientId,
        memberId,
        ...rest,
        domains: JSON.stringify(domains),
      },
      include: memberAuthorInclude,
    });
  },

  async updateEvaluation(
    organizationId: string,
    id: string,
    data: EvaluationFormInput,
  ) {
    const existing = await db.evaluation.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    const { patientId, domains, ...rest } = data;
    return db.evaluation.update({
      where: { id },
      data: {
        patientId,
        ...rest,
        domains: JSON.stringify(domains),
      },
      include: memberAuthorInclude,
    });
  },

  async deleteEvaluation(organizationId: string, id: string) {
    const existing = await db.evaluation.findFirst({
      where: { id, patient: { organizationId } },
    });
    if (!existing) return null;
    await db.evaluation.delete({ where: { id } });
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
        atividades: data.atividades ?? "",
        observacoes: data.observacoes ?? "",
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
        atividades: data.atividades ?? "",
        observacoes: data.observacoes ?? "",
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
