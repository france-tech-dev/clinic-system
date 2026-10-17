import { parseCivilDateParam } from "@/shared/lib/date/civil-date-param";
import { db } from "@/shared/lib/prisma";
import { PatientPricingType, PatientSex, Role } from "@prisma/enums";
import type { PatientFormInput, UpdatePatientInput } from "./patient.schema";
import type { PatientStatus } from "./patient.types";

/** Shape mínimo para create composto (sem importar domains/guardian). */
export type NewGuardianWriteInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  cpf?: string | null;
  address?: string | null;
  zipCode?: string | null;
  documentImageUrl?: string | null;
  insurance?: string | null;
  motherName?: string | null;
  motherCpf?: string | null;
  fatherName?: string | null;
  fatherCpf?: string | null;
};

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

function toEmbeddedGuardianWrite(data: NewGuardianWriteInput) {
  return {
    name: data.name,
    phone: data.phone ?? "",
    email: data.email ?? null,
    cpf: data.cpf ?? null,
    address: data.address ?? "",
    zipCode: data.zipCode ?? "",
    documentImageUrl: data.documentImageUrl ?? null,
    insurance: data.insurance ?? "particular",
    motherName: data.motherName ?? "",
    motherCpf: data.motherCpf ?? null,
    fatherName: data.fatherName ?? "",
    fatherCpf: data.fatherCpf ?? null,
  };
}

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
    select: { assessments: true, evolutions: true },
  },
  assessments: {
    orderBy: { date: "desc" as const },
    take: 1,
    select: { date: true },
  },
} as const;

function patientListWhere(
  organizationId: string,
  opts?: {
    status?: PatientStatus | null;
    search?: string;
    memberId?: string | null;
  },
) {
  return {
    organizationId,
    ...(opts?.status ? { status: opts.status } : {}),
    ...(opts?.search ? { name: { contains: opts.search } } : {}),
    ...(opts?.memberId ? { members: { some: { id: opts.memberId } } } : {}),
  };
}

export const patientRepository = {
  async findMany(
    organizationId: string,
    opts?: {
      status?: PatientStatus | null;
      search?: string;
      memberId?: string | null;
      skip?: number;
      take?: number;
    },
  ) {
    return db.patient.findMany({
      where: patientListWhere(organizationId, opts),
      include: patientListInclude,
      orderBy: { name: "asc" },
      ...(opts?.skip != null ? { skip: opts.skip } : {}),
      ...(opts?.take != null ? { take: opts.take } : {}),
    });
  },

  async count(
    organizationId: string,
    opts?: {
      status?: PatientStatus | null;
      search?: string;
      memberId?: string | null;
    },
  ) {
    return db.patient.count({
      where: patientListWhere(organizationId, opts),
    });
  },

  async findById(organizationId: string, id: string) {
    return db.patient.findFirst({
      where: { id, organizationId },
      include: {
        guardian: { select: guardianSelect },
        ...membersInclude,
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
    if (data.guardianId) {
      const guardian = await db.guardian.findFirst({
        where: { id: data.guardianId, organizationId },
        select: { id: true },
      });
      if (!guardian) return null;
    }

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
        birthDate: parseCivilDateParam(data.birthDate),
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

  /**
   * Create atómico: responsável novo + paciente (mesmo caso de uso).
   * Portal / Better Auth ficam fora — ver composite-writes.mdc.
   */
  async createWithNewGuardian(
    organizationId: string,
    guardianForm: NewGuardianWriteInput,
    patientData: Omit<PatientFormInput, "guardianId"> & {
      memberIds?: string[];
    },
  ) {
    const uniqueMemberIds = [...new Set(patientData.memberIds ?? [])];
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

    return db.$transaction(async (tx) => {
      const guardianRow = await tx.guardian.create({
        data: {
          organizationId,
          ...toEmbeddedGuardianWrite(guardianForm),
        },
        select: guardianSelect,
      });

      const patientRow = await tx.patient.create({
        data: {
          organizationId,
          guardianId: guardianRow.id,
          name: patientData.name,
          birthDate: parseCivilDateParam(patientData.birthDate),
          sex: patientData.sex ?? PatientSex.NOT_INFORMED,
          photoUrl: patientData.photoUrl ?? null,
          notes: patientData.notes ?? "",
          pricingType: patientData.pricingType ?? PatientPricingType.SESSION,
          price: patientData.price ?? null,
          ...(uniqueMemberIds.length > 0
            ? { members: { connect: uniqueMemberIds.map((id) => ({ id })) } }
            : {}),
        },
        include: patientListInclude,
      });

      return { guardianRow, patientRow };
    });
  },

  async update(organizationId: string, id: string, data: Omit<UpdatePatientInput, "id">) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!existing) return null;

    if (data.guardianId) {
      const guardian = await db.guardian.findFirst({
        where: { id: data.guardianId, organizationId },
        select: { id: true },
      });
      if (!guardian) return null;
    }

    return db.patient.update({
      where: { id },
      data: {
        guardianId: data.guardianId,
        name: data.name,
        birthDate: parseCivilDateParam(data.birthDate),
        sex: data.sex ?? PatientSex.NOT_INFORMED,
        notes: data.notes ?? "",
        pricingType: data.pricingType ?? PatientPricingType.SESSION,
        price: data.price ?? null,
      },
      include: patientListInclude,
    });
  },

  async updatePhotoUrl(organizationId: string, id: string, photoUrl: string | null) {
    const existing = await db.patient.findFirst({
      where: { id, organizationId },
      select: { id: true, photoUrl: true },
    });
    if (!existing) return null;

    return db.patient.update({
      where: { id },
      data: { photoUrl },
      include: patientListInclude,
    });
  },

  async updateStatus(organizationId: string, id: string, status: PatientStatus) {
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

  async setMembers(organizationId: string, patientId: string, memberIds: string[]) {
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
};
