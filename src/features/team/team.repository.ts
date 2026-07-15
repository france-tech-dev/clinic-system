import { hashPassword } from "better-auth/crypto";
import { db } from "@/shared/lib/prisma";
import type { CreateProfessionalInput } from "./team.schema";

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

  async createUserWithPassword(data: {
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    password: string;
  }) {
    const hashed = await hashPassword(data.password);
    return db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          emailVerified: true,
          phone: data.phone,
          birthDate: parseBirthDate(data.birthDate),
          mustChangePassword: true,
        },
      });

      await tx.account.create({
        data: {
          userId: user.id,
          accountId: user.id,
          providerId: "credential",
          password: hashed,
        },
      });

      return user;
    });
  },

  async updateMemberProfile(
    memberId: string,
    data: {
      profession: string;
      registro: string;
      metadata: string;
    },
  ) {
    return db.member.update({
      where: { id: memberId },
      data: {
        profession: data.profession,
        registro: data.registro,
        metadata: data.metadata,
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
