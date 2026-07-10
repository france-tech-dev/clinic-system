"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { professionalProfileSchema } from "./settings.schema";
import {
  getProfessionalProfile,
  saveProfessionalProfile,
} from "./settings.service";
import type { ProfessionalProfile } from "./settings.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

export async function getProfessionalAction(): Promise<
  ActionResult<ProfessionalProfile>
> {
  try {
    const { organizationId } = await requireOrgId();
    return ok(await getProfessionalProfile(organizationId));
  } catch (error) {
    return handleError(error);
  }
}

export async function saveProfessionalAction(
  input: unknown,
): Promise<ActionResult<ProfessionalProfile>> {
  try {
    const parsed = professionalProfileSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const { organizationId } = await requireOrgId();
    const data = await saveProfessionalProfile(organizationId, parsed.data);
    revalidatePath(paths.painel);
    revalidatePath(paths.configuracoes);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
