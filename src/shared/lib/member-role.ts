import { Role } from "../../../prisma/generated/prisma/enums";

/** Papéis que podem aceder à área autenticada da clínica. */
const PANEL_ROLES = new Set<string>([
  Role.OWNER,
  Role.ADMIN,
  Role.MANAGER,
  Role.MEMBER,
]);

export function normalizeMemberRole(
  role: string | Role | null | undefined,
): string | null {
  if (role == null || role === "") return null;
  return String(role).trim().toUpperCase();
}

export function canAccessClinicPanel(
  role: string | Role | null | undefined,
): boolean {
  const normalized = normalizeMemberRole(role);
  return normalized != null && PANEL_ROLES.has(normalized);
}
