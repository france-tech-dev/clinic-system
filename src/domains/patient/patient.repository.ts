import { db } from "@/shared/lib/prisma";
import {
  PatientPricingType,
  PatientSex,
  Role,
} from "@prisma/enums";
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

const membersInclude = {
  members: {
    select: {
      id: true,
      user: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: "asc" as const },
  },
} as const;

const patientListInclude = {
  guardian: { select: guardianSelect },
  ...membersInclude,
  _count: {
    select: { clinicalEvaluations: true, sessionNotes: true },
  },
  clinicalEvaluations: {
    orderBy: { date: "desc" as const },
    take: 1,
    select: { date: true },
  },
} as const;

export const patientRepository = {
  async findMany(
    organizationId: string,
    opts?: {
      status?: PatientStatus | null;
      search?: string;
      memberId?: string | null;
    },
  ) {
    return db.patient.findMany({
      where: {
        organizationId,
        ...(opts?.status ? { status: opts.status } : {}),
        ...(opts?.search ? { name: { contains: opts.search } } : {}),
        ...(opts?.memberId ? { members: { some: { id: opts.memberId } } } : {}),
      },
      include: patientListInclude,
      orderBy: { name: "asc" },
    });
  },

  async findById(organizationId: string, id: string) {
    return db.patient.findFirst({
      where: { id, organizationId },
      include: {
        guardian: { select: guardianSelect },
        ...membersInclude,
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
      },
    });
  },

  async findListById(organizationId: string, id: string) {
    return db.patient.findFirst({
      where: { id, organizationId },
      include: patientListInclude,
    });
  },

  async create(organizationId: string, data: PatientFormInput) {
    const guardian = await db.guardian.findFirst({
      where: { id: data.guardianId, organizationId },
      select: { id: true },
    });
    if (!guardian) return null;

    const uniqueMemberIds = [...new Set(data.memberIds ?? [])];
    if (uniqueMemberIds.length > 0) {
      const members = await db.member.findMany({
        where: {
          organizationId,
          id: { in: uniqueMemberIds },
          role: { not: Role.CLIENT },
        },
        select: { id: true },
      });
      if (members.length !== uniqueMemberIds.length) {
        throw new Error("Profissional inválido para esta clínica.");
      }
    }

    return db.patient.create({
      data: {
        organizationId,
        guardianId: data.guardianId,
        name: data.name,
        birthDate: parseBirthDateParam(data.birthDate),
        sex: data.sex ?? PatientSex.NOT_INFORMED,
        photoUrl: data.photoUrl ?? null,
        notes: data.notes ?? "",
        pricingType: data.pricingType ?? PatientPricingType.SESSION,
        price: data.price ?? null,
        ...(uniqueMemberIds.length > 0
          ? { members: { connect: uniqueMemberIds.map((id) => ({ id })) } }
          : {}),
      },
      include: patientListInclude,
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
        sex: data.sex ?? PatientSex.NOT_INFORMED,
        photoUrl: data.photoUrl ?? null,
        notes: data.notes ?? "",
        pricingType: data.pricingType ?? PatientPricingType.SESSION,
        price: data.price ?? null,
      },
      include: patientListInclude,
    });
  },

  async updateStatus(
    organizationId: string,
    id: string,
    status: PatientStatus,
  ) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!existing) return null;
    return db.patient.update({
      where: { id },
      data: { status },
      include: patientListInclude,
    });
  },

  async setMembers(
    organizationId: string,
    patientId: string,
    memberIds: string[],
  ) {
    const patient = await db.patient.findFirst({
      where: { id: patientId, organizationId },
      select: { id: true },
    });
    if (!patient) return null;

    const uniqueIds = [...new Set(memberIds)];
    if (uniqueIds.length > 0) {
      const members = await db.member.findMany({
        where: {
          organizationId,
          id: { in: uniqueIds },
          role: { not: Role.CLIENT },
        },
        select: { id: true },
      });
      if (members.length !== uniqueIds.length) {
        throw new Error("Profissional inválido para esta clínica.");
      }
    }

    await db.patient.update({
      where: { id: patientId },
      data: {
        members: {
          set: uniqueIds.map((id) => ({ id })),
        },
      },
    });

    return this.findListById(organizationId, patientId);
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
      include: patientListInclude,
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
};
