import { Role } from "@prisma/enums";

export const MEMBER_ROLE_LABEL = {
  [Role.OWNER]: "Proprietário",
  [Role.ADMIN]: "Administrador",
  [Role.MANAGER]: "Gestor",
  [Role.MEMBER]: "Membro",
  [Role.CLIENT]: "Cliente",
} as const satisfies Record<Role, string>;

export function memberRoleLabel(role: Role): string {
  return MEMBER_ROLE_LABEL[role];
}

export const ASSIGNABLE_MEMBER_ROLE_OPTIONS = [
  { value: Role.MEMBER, label: MEMBER_ROLE_LABEL[Role.MEMBER] },
  { value: Role.MANAGER, label: MEMBER_ROLE_LABEL[Role.MANAGER] },
  { value: Role.ADMIN, label: MEMBER_ROLE_LABEL[Role.ADMIN] },
] as const;

export const MEMBER_ROLE_OPTIONS = [
  ...ASSIGNABLE_MEMBER_ROLE_OPTIONS,
  { value: Role.OWNER, label: MEMBER_ROLE_LABEL[Role.OWNER] },
] as const;
