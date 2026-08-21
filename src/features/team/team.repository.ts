import { hashPassword } from "better-auth/crypto";
import { createCredentialUser } from "@/shared/lib/create-credential-user";
import { db } from "@/shared/lib/prisma";
import {
  MemberStatus,
  Role,
} from "../../../prisma/generated/prisma/enums";
import type { CreateProfessionalInput } from "./team.schema";

const memberListInclude = {
  user: {
    select: {
      id: true,
      name: true,
      image: true,
      email: true,
      phone: true,
      birthDate: true,
    },
  },
  patients: {
    select: { id: true, name: true, photoUrl: true },
    orderBy: { name: "asc" as const },
  },
} as const;

function parseOptionalBirthDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const [year, month, day] = value.split("-").map(Number);
  if ([year, month, day].some(Number.isNaN)) return null;
  return new Date(Date.UTC(year, month - 1, day));
}

export const teamRepository = {
  async listMembers(organizationId: string) {
    return db.member.findMany({
      where: {
        organizationId,
        role: { not: Role.CLIENT },
      },
      include: memberListInclude,
      orderBy: { createdAt: "asc" },
    });
  },

  async findById(organizationId: string, memberId: string) {
    return db.member.findFirst({
      where: {
        id: memberId,
        organizationId,
        role: { not: Role.CLIENT },
      },
      include: memberListInclude,
    });
  },

  async setPatients(
    organizationId: string,
    memberId: string,
    patientIds: string[],
  ) {
    const member = await db.member.findFirst({
      where: {
        id: memberId,
        organizationId,
        role: { not: Role.CLIENT },
      },
      select: { id: true },
    });
    if (!member) return null;

    const uniqueIds = [...new Set(patientIds)];
    if (uniqueIds.length > 0) {
      const patients = await db.patient.findMany({
        where: {
          organizationId,
          id: { in: uniqueIds },
        },
        select: { id: true },
      });
      if (patients.length !== uniqueIds.length) {
        throw new Error("Paciente inválido para esta clínica.");
      }
    }

    await db.member.update({
      where: { id: memberId },
      data: {
        patients: {
          set: uniqueIds.map((id) => ({ id })),
        },
      },
    });

    return this.findById(organizationId, memberId);
  },

  async findUserByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
  },

  async markEmailVerified(userId: string) {
    return db.user.update({
      where: { id: userId },
      data: { emailVerified: true },
      select: { id: true },
    });
  },

  async findMemberByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: { organizationId, userId },
      select: { id: true },
    });
  },

  async findMemberProfileByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: {
        organizationId,
        userId,
        role: { not: Role.CLIENT },
      },
      include: memberListInclude,
    });
  },

  async findMemberForUpdate(organizationId: string, memberId: string) {
    return db.member.findFirst({
      where: { id: memberId, organizationId },
      select: {
        id: true,
        userId: true,
        role: true,
        status: true,
        metadata: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  },

  async countAppointmentsByMember(memberId: string) {
    return db.appointment.count({ where: { memberId } });
  },

  async deleteMember(organizationId: string, memberId: string) {
    return db.member.deleteMany({
      where: { id: memberId, organizationId },
    });
  },

  async createUserWithPassword(data: {
    name: string;
    email: string;
    phone?: string | null;
    birthDate?: string | null;
    password: string;
  }) {
    return createCredentialUser({
      name: data.name,
      email: data.email,
      phone: data.phone,
      birthDate: data.birthDate,
      password: data.password,
    });
  },

  async updateMemberProfile(
    memberId: string,
    data: {
      profession?: string;
      registration?: string;
      metadata?: string;
      status?: MemberStatus;
      role?: Role;
    },
  ) {
    return db.member.update({
      where: { id: memberId },
      data: {
        ...(data.profession !== undefined
          ? { profession: data.profession }
          : {}),
        ...(data.registration !== undefined
          ? { registration: data.registration }
          : {}),
        ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.role !== undefined ? { role: data.role } : {}),
      },
    });
  },

  async updateUserProfile(
    userId: string,
    data: {
      name: string;
      email: string;
      phone?: string | null;
      birthDate?: string | null;
    },
  ) {
    return db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone?.trim() || null,
        birthDate: parseOptionalBirthDate(data.birthDate),
      },
    });
  },

  async findUserMustChangePassword(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      select: { id: true, mustChangePassword: true },
    });
  },

  async setCredentialPassword(userId: string, password: string) {
    const hashed = await hashPassword(password);
    return db.$transaction(async (tx) => {
      const account = await tx.account.findFirst({
        where: { userId, providerId: "credential" },
        select: { id: true },
      });
      if (!account) {
        throw new Error("Conta de senha não encontrada");
      }
      await tx.account.update({
        where: { id: account.id },
        data: { password: hashed },
      });
      await tx.user.update({
        where: { id: userId },
        data: { mustChangePassword: false },
      });
    });
  },
};

export type { CreateProfessionalInput };
