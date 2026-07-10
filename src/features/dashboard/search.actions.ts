"use server";

import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { globalSearch, type SearchHit } from "./search.service";

export async function globalSearchAction(
  query: string,
): Promise<ActionResult<SearchHit[]>> {
  try {
    const { organizationId } = await requireOrgId();
    return ok(await globalSearch(organizationId, query));
  } catch (error) {
    if (error instanceof OrgContextError) return fail(error.message);
    console.error(error);
    return fail("Não foi possível buscar.");
  }
}
