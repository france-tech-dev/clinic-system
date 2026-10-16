"use server";

import { auth } from "@/shared/lib/auth";
import { db } from "@/shared/lib/prisma";
import { headers } from "next/headers";
import { requirePermission } from "../auth/permissions";
export const addMember = async (userId: string, organizationId: string, role: string) => {
  try {
    await requirePermission({ team: ["create"] });
    await auth.api.addMember({
      body: {
        userId,
        role: role as "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "CLIENT",
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
    await requirePermission({ team: ["delete"] });
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

export const sendInvitationMember = async (email: string, role: string, organizationId: string) => {
  try {
    await requirePermission({ team: ["create"] });
    await auth.api.createInvitation({
      body: {
        email,
        role: role as "OWNER" | "ADMIN" | "MANAGER" | "MEMBER" | "CLIENT",
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
