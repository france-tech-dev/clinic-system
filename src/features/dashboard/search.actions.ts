"use server";

import { requirePermission } from "@/server/auth/permissions";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { globalSearch, type SearchHit } from "./search.service";

export async function globalSearchAction(
  query: string,
): Promise<ActionResult<SearchHit[]>> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    return ok(await globalSearch(organizationId, query));
  } catch (error) {
    if (error instanceof OrgContextError) return fail(error.message);
    if (error instanceof Error) return fail(error.message);
    console.error(error);
    return fail("Não foi possível buscar.");
  }
}
