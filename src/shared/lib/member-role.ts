import { Role } from "@prisma/enums";

const PANEL_ROLES: readonly Role[] = [
  Role.OWNER,
  Role.ADMIN,
  Role.MANAGER,
  Role.MEMBER,
];

export const LEADERSHIP_ROLES: readonly Role[] = [
  Role.OWNER,
  Role.ADMIN,
  Role.MANAGER,
];

export function canAccessClinicPanel(role: Role | null): boolean {
  return role != null && PANEL_ROLES.includes(role);
}

export function isLeadershipRole(role: Role | null): boolean {
  return role != null && LEADERSHIP_ROLES.includes(role);
}
