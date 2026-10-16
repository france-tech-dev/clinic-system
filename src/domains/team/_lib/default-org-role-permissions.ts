import {
  ADMIN,
  CLIENT,
  CLINIC_RESOURCES,
  MANAGER,
  MEMBER,
  OWNER,
  type ClinicAction,
} from "@/shared/lib/permissions";
import type { OrgRolePermissionMatrix } from "../org-role.types";

function clinicOnly(statements: Record<string, readonly string[]>): OrgRolePermissionMatrix {
  const out: OrgRolePermissionMatrix = {};
  for (const resource of CLINIC_RESOURCES) {
    const actions = statements[resource];
    if (actions?.length) {
      out[resource] = [...actions] as ClinicAction[];
    }
  }
  return out;
}

export const PRESET_ROLE_PERMISSIONS: Record<string, OrgRolePermissionMatrix> = {
  OWNER: clinicOnly(OWNER.statements),
  ADMIN: clinicOnly(ADMIN.statements),
  MANAGER: clinicOnly(MANAGER.statements),
  MEMBER: clinicOnly(MEMBER.statements),
  CLIENT: clinicOnly(CLIENT.statements),
};

export function emptyPermissionMatrix(): OrgRolePermissionMatrix {
  return Object.fromEntries(
    CLINIC_RESOURCES.map((r) => [r, [] as ClinicAction[]]),
  ) as OrgRolePermissionMatrix;
}

export function countActions(permission: OrgRolePermissionMatrix, action: ClinicAction): number {
  return CLINIC_RESOURCES.reduce((n, resource) => {
    return n + (permission[resource]?.includes(action) ? 1 : 0);
  }, 0);
}

export function totalResourcesWithAny(permission: OrgRolePermissionMatrix): number {
  return CLINIC_RESOURCES.filter((r) => (permission[r]?.length ?? 0) > 0).length;
}
