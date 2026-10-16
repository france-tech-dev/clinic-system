import { auth } from "@/shared/lib/auth";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { CLINIC_RESOURCES, type ClinicResource } from "@/shared/lib/permissions";
import { headers } from "next/headers";

export type ModuleAccess = Partial<Record<ClinicResource, boolean>>;

/** Recursos com `requires` na sidebar hoje — manter alinhado a sidebar-items. */
const SIDEBAR_GATE_RESOURCES = ["finance", "team"] as const satisfies readonly ClinicResource[];

/**
 * Resolve acesso read por módulo para a sidebar.
 * Liderança → todos true. Senão: 1 hasPermission com os gates da sidebar;
 * se o AND falhar, avalia cada recurso.
 */
export async function getClinicModuleAccess(role: string | null): Promise<ModuleAccess> {
  if (isLeadershipRole(role)) {
    return Object.fromEntries(CLINIC_RESOURCES.map((r) => [r, true])) as ModuleAccess;
  }

  const h = await headers();
  const permissions = Object.fromEntries(
    SIDEBAR_GATE_RESOURCES.map((resource) => [resource, ["read"] as const]),
  );

  try {
    const result = await auth.api.hasPermission({
      headers: h,
      body: { permissions },
    });
    if (result.success === true) {
      return Object.fromEntries(SIDEBAR_GATE_RESOURCES.map((r) => [r, true])) as ModuleAccess;
    }
  } catch {
    /* fallback abaixo */
  }

  const entries = await Promise.all(
    SIDEBAR_GATE_RESOURCES.map(async (resource) => {
      try {
        const result = await auth.api.hasPermission({
          headers: h,
          body: { permissions: { [resource]: ["read"] } },
        });
        return [resource, result.success === true] as const;
      } catch {
        return [resource, false] as const;
      }
    }),
  );

  return Object.fromEntries(entries);
}
