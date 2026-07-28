import { hashPassword } from "better-auth/crypto";
import { createCredentialUser } from "@/shared/lib/create-credential-user";
import { db } from "@/shared/lib/prisma";
import type { Role } from "../../../prisma/generated/prisma/enums";
import type { CreateProfessionalInput } from "./team.schema";
import type { TeamMemberStatus } from "./team.types";

function parseBirthDate(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export const teamRepository = {
  async listMembers(organizationId: string) {
    return db.member.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            birthDate: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
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
      select: { id: true },
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

  async createUserWithPassword(data: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
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
      profession: string;
      registration: string;
      metadata: string;
      status?: TeamMemberStatus;
      role?: Role;
    },
  ) {
    return db.member.update({
      where: { id: memberId },
      data: {
        profession: data.profession,
        registration: data.registration,
        metadata: data.metadata,
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
      phone: string;
      birthDate: string;
    },
  ) {
    return db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        birthDate: parseBirthDate(data.birthDate),
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
