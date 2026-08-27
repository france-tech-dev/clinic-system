"use server";

import { auth } from "@/shared/lib/auth";
import { db } from "@/shared/lib/prisma";
import { requirePermission } from "../auth/permissions";
import { headers } from "next/headers";
import { Role } from "@prisma/enums";

export const addMember = async (
  userId: string,
  organizationId: string,
  role: Role,
) => {
  try {
    await requirePermission({ project: ["create"] });
    await auth.api.addMember({
      body: {
        userId,
        role,
        organizationId,
      },
    });
    return {
      success: true as const,
      message: "Membro adicionado com sucesso",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false as const,
      message: e.message || "Falha ao adicionar membro",
    };
  }
};

export const removeMember = async (memberId: string) => {
  try {
    await requirePermission({ project: ["delete"] });
    await db.member.delete({
      where: {
        id: memberId,
      },
    });
    return {
      success: true as const,
      message: "Membro removido com sucesso",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false as const,
      message: e.message || "Falha ao remover membro",
    };
  }
};

export const sendInvitationMember = async (
  email: string,
  role: Role,
  organizationId: string,
) => {
  try {
    await requirePermission({ project: ["create"] });
    await auth.api.createInvitation({
      body: {
        email,
        role,
        organizationId,
        resend: true,
      },
      headers: await headers(),
    });
    return {
      success: true as const,
      message: "Convite enviado com sucesso",
    };
  } catch (error) {
    const e = error as Error;
    return {
      success: false as const,
      message: e.message || "Falha ao enviar convite",
    };
  }
};
