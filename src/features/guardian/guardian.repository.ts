import { db } from "@/shared/lib/prisma";
import type { GuardianFormInput } from "./guardian.schema";

export const guardianSelect = {
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

function toWriteData(data: GuardianFormInput) {
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

export const guardianRepository = {
  async findMany(organizationId: string) {
    return db.guardian.findMany({
      where: { organizationId },
      select: guardianSelect,
      orderBy: { name: "asc" },
    });
  },

  async findById(organizationId: string, id: string) {
    return db.guardian.findFirst({
      where: { id, organizationId },
      select: guardianSelect,
    });
  },

  async findByCpf(organizationId: string, cpf: string, excludeId?: string) {
    return db.guardian.findFirst({
      where: {
        organizationId,
        cpf,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });
  },

  async findUserByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
  },

  async findMemberByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: { organizationId, userId },
      select: { id: true, role: true },
    });
  },

  async create(organizationId: string, data: GuardianFormInput) {
    return db.guardian.create({
      data: {
        organizationId,
        ...toWriteData(data),
      },
      select: guardianSelect,
    });
  },

  async update(organizationId: string, id: string, data: GuardianFormInput) {
    const existing = await db.guardian.findFirst({
      where: { id, organizationId },
      select: { id: true },
    });
    if (!existing) return null;
    return db.guardian.update({
      where: { id },
      data: toWriteData(data),
      select: guardianSelect,
    });
  },

  async linkUser(organizationId: string, id: string, userId: string) {
    const existing = await db.guardian.findFirst({
      where: { id, organizationId },
      select: { id: true, userId: true },
    });
    if (!existing) return null;
    if (existing.userId) {
      throw new Error("Este responsável já tem acesso ao portal");
    }
    return db.guardian.update({
      where: { id },
      data: { userId },
      select: guardianSelect,
    });
  },
};
