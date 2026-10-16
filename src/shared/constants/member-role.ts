import { Role } from "@prisma/enums";

export const MEMBER_ROLE_LABEL = {
  [Role.OWNER]: "Proprietário",
  [Role.ADMIN]: "Administração",
  [Role.MANAGER]: "Supervisão / Gestão",
  [Role.MEMBER]: "Colaborador / Profissional",
  [Role.CLIENT]: "Responsável",
} as const satisfies Record<Role, string>;

export function memberRoleLabel(role: string): string {
  return MEMBER_ROLE_LABEL[role as Role] ?? role;
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

/** Papéis de sistema que não podem ser apagados. */
export const SYSTEM_ROLE_SLUGS = [Role.OWNER, Role.CLIENT] as const;

/** Papéis padrão seedados (editáveis via DAC; não apagar se tiverem membros). */
export const DEFAULT_ORG_ROLE_SLUGS = [
  Role.ADMIN,
  Role.MANAGER,
  Role.MEMBER,
] as const;
