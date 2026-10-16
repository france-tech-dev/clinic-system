import { db } from "@/shared/lib/prisma";
import { toGuardianWriteData } from "./_lib/to-guardian-write-data";
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
        ...toGuardianWriteData(data),
      },
      select: guardianSelect,
    });
  },

  async updateById(id: string, data: GuardianFormInput) {
    return db.guardian.update({
      where: { id },
      data: toGuardianWriteData(data),
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

  /** Compensa user/member órfãos (cascata Prisma em Account/Session/Member). */
  async deleteCredentialUserCascade(userId: string) {
    await db.user.delete({ where: { id: userId } });
  },
};
