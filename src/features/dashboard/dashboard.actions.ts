"use server";

import { getDashboardData } from "@/features/dashboard/dashboard.service";
import type { DashboardData } from "@/features/dashboard/dashboard.types";
import { requirePermission } from "@/server/auth/permissions";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";

export async function getDashboardAction(): Promise<
  ActionResult<DashboardData>
> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    const data = await getDashboardData(organizationId);
    return ok(data);
  } catch (error) {
    if (error instanceof OrgContextError) return fail(error.message);
    if (error instanceof Error) return fail(error.message);
    console.error(error);
    return fail("Não foi possível carregar o painel.");
  }
}
