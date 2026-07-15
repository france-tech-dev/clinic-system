import { auth } from "@/shared/lib/auth";
import { serializeMemberProfessionalMetadata } from "@/shared/types/professional";
import { getHealthProfession } from "@/shared/constants/professions";
import { Role } from "../../../prisma/generated/prisma/enums";
import { teamRepository } from "./team.repository";
import type { CreateProfessionalInput } from "./team.schema";
import type { CreatedProfessionalDTO, TeamMemberDTO } from "./team.types";

function toMemberRole(role: CreateProfessionalInput["role"]): Role {
  switch (role) {
    case "ADMIN":
      return Role.ADMIN;
    case "MANAGER":
      return Role.MANAGER;
    default:
      return Role.MEMBER;
  }
}

function formatBirthDate(value: Date | null | undefined): string | null {
  if (!value) return null;
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function listTeamMembers(
  organizationId: string,
): Promise<TeamMemberDTO[]> {
  const rows = await teamRepository.listMembers(organizationId);
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    role: row.role,
    profession: row.profession,
    registro: row.registro,
    name: row.user.name?.trim() || "Sem nome",
    email: row.user.email?.trim() || "",
    phone: row.user.phone,
    birthDate: formatBirthDate(row.user.birthDate),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function createProfessional(
  organizationId: string,
  input: CreateProfessionalInput,
): Promise<CreatedProfessionalDTO> {
  const email = input.email.trim().toLowerCase();
  const existing = await teamRepository.findUserByEmail(email);
  if (existing) {
    throw new Error("Já existe um utilizador com este e-mail");
  }

  const profession = getHealthProfession(input.profession);
  if (!profession) {
    throw new Error("Profissão inválida");
  }

  const user = await teamRepository.createUserWithPassword({
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    birthDate: input.birthDate,
    password: input.password,
  });

  await auth.api.addMember({
    body: {
      userId: user.id,
      organizationId,
      role: toMemberRole(input.role),
    },
  });

  const member = await teamRepository.findMemberByUserId(
    organizationId,
    user.id,
  );
  if (!member) {
    throw new Error("Membro criado sem vínculo na organização");
  }

  const registro = input.registro.trim();
  await teamRepository.updateMemberProfile(member.id, {
    profession: input.profession,
    registro,
    metadata: serializeMemberProfessionalMetadata({
      nome: input.name.trim(),
      registro,
    }),
  });

  return {
    memberId: member.id,
    userId: user.id,
    email,
    mustChangePassword: true,
  };
}

export async function changeForcedPassword(
  userId: string,
  newPassword: string,
): Promise<void> {
  const user = await teamRepository.findUserMustChangePassword(userId);
  if (!user) {
    throw new Error("Utilizador não encontrado");
  }
  if (!user.mustChangePassword) {
    throw new Error("Não é necessário alterar a senha");
  }
  await teamRepository.setCredentialPassword(userId, newPassword);
}
