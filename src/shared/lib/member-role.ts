import { Role } from "@prisma/enums";

/** Papéis de sistema / padrão (slugs). Roles dinâmicas são strings livres. */
export type MemberRoleSlug = Role | string;

export const LEADERSHIP_ROLES: readonly Role[] = [Role.OWNER, Role.ADMIN, Role.MANAGER];

const LEADERSHIP_SET: ReadonlySet<string> = new Set(LEADERSHIP_ROLES);

/** Painel clínico: qualquer papel excepto CLIENT (inclui roles dinâmicas). */
export function canAccessClinicPanel(role: string | null): boolean {
  return role != null && role !== Role.CLIENT;
}

/**
 * Tier operacional OWNER/ADMIN/MANAGER.
 * Roles custom → gates via `hasPermission` / `requirePermission` (não este helper).
 */
export function isLeadershipRole(role: string | null): boolean {
  return role != null && LEADERSHIP_SET.has(role);
}
