import { auth } from "@/shared/lib/auth";
import { serializeMemberProfessionalMetadata } from "@/shared/types/professional";
import { getHealthProfession } from "@/shared/constants/professions";
import { Role } from "../../../prisma/generated/prisma/enums";
import { teamRepository } from "./team.repository";
import type {
  CreateProfessionalInput,
  UpdateProfessionalInput,
} from "./team.schema";
import type {
  CreatedProfessionalDTO,
  TeamMemberDTO,
  TeamMemberStatus,
} from "./team.types";

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

function toTeamMemberStatus(status: string): TeamMemberStatus {
  return status === "inactive" ? "inactive" : "active";
}

export async function listTeamMembers(
  organizationId: string,
): Promise<TeamMemberDTO[]> {
  const rows = await teamRepository.listMembers(organizationId);
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    role: row.role,
    status: toTeamMemberStatus(row.status),
    profession: row.profession,
    registration: row.registration,
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
  const profession = getHealthProfession(input.profession);
  if (!profession) {
    throw new Error("Profissão inválida");
  }

  const existing = await teamRepository.findUserByEmail(email);
  let userId: string;
  let mustChangePassword: boolean;

  if (existing) {
    const alreadyMember = await teamRepository.findMemberByUserId(
      organizationId,
      existing.id,
    );
    if (alreadyMember) {
      throw new Error("Este profissional já faz parte desta clínica");
    }
    userId = existing.id;
    mustChangePassword = false;
  } else {
    const user = await teamRepository.createUserWithPassword({
      name: input.name.trim(),
      email,
      phone: input.phone?.trim() ?? "",
      birthDate: input.birthDate ?? "",
      password: input.password,
    });
    userId = user.id;
    mustChangePassword = true;
  }

  await auth.api.addMember({
    body: {
      userId,
      organizationId,
      role: toMemberRole(input.role),
    },
  });

  const member = await teamRepository.findMemberByUserId(
    organizationId,
    userId,
  );
  if (!member) {
    throw new Error("Membro criado sem vínculo na organização");
  }

  const registration = input.registration?.trim() ?? "";
  await teamRepository.updateMemberProfile(member.id, {
    profession: profession.id,
    registration,
    metadata: serializeMemberProfessionalMetadata({
      name: input.name.trim(),
      registration,
    }),
  });

  return {
    memberId: member.id,
    userId,
    email,
    mustChangePassword,
  };
}

export async function updateProfessional(
  organizationId: string,
  actorUserId: string,
  input: UpdateProfessionalInput,
): Promise<void> {
  const member = await teamRepository.findMemberForUpdate(
    organizationId,
    input.memberId,
  );
  if (!member) {
    throw new Error("Profissional não encontrado nesta clínica");
  }

  const profession = getHealthProfession(input.profession);
  if (!profession) {
    throw new Error("Profissão inválida");
  }

  const isOwner = member.role === Role.OWNER;
  const isSelf = member.userId === actorUserId;

  if (isSelf && input.status === "inactive") {
    throw new Error("Não pode desativar o seu próprio acesso");
  }

  if (isOwner && input.status === "inactive") {
    throw new Error("Não é possível desativar o proprietário da clínica");
  }

  if (!isOwner && input.role === "OWNER") {
    throw new Error("Papel inválido");
  }

  if (!isOwner && isSelf && input.role !== member.role) {
    throw new Error("Não pode alterar o seu próprio papel");
  }

  if (isOwner && input.role !== "OWNER") {
    throw new Error("Não é possível alterar o papel do proprietário");
  }

  const email = input.email.trim().toLowerCase();
  if (email !== (member.user.email?.trim().toLowerCase() ?? "")) {
    const existing = await teamRepository.findUserByEmail(email);
    if (existing && existing.id !== member.userId) {
      throw new Error("Já existe um utilizador com este e-mail");
    }
  }

  const name = input.name.trim();
  const registration = input.registration?.trim() ?? "";

  await teamRepository.updateUserProfile(member.userId, {
    name,
    email,
    phone: input.phone?.trim() ?? "",
    birthDate: input.birthDate ?? "",
  });

  const nextRole =
    isOwner || input.role === "OWNER" ? undefined : toMemberRole(input.role);

  await teamRepository.updateMemberProfile(member.id, {
    profession: profession.id,
    registration,
    metadata: serializeMemberProfessionalMetadata(
      {
        name: name,
        registration,
      },
      member.metadata,
    ),
    status: input.status,
    ...(nextRole !== undefined ? { role: nextRole } : {}),
  });
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
