"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { anamneseSaveSchema, getAnamneseSchema } from "./anamnese.schema";
import { getAnamnese, saveAnamnese } from "./anamnese.service";
import type { AnamneseDTO } from "./anamnese.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidateAnamnese(formId: string, patientId: string) {
  revalidatePath(paths.anamnese.byId(formId));
  revalidatePath(paths.anamnese.root);
  revalidatePath(paths.paciente(patientId));
}

export async function getAnamneseAction(
  input: unknown,
): Promise<ActionResult<AnamneseDTO | null>> {
  try {
    await requirePermission({ project: ["read"] });
    const parsed = getAnamneseSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");
    const { organizationId } = await requireOrgId();
    const data = await getAnamnese(
      organizationId,
      parsed.data.patientId,
      parsed.data.formId,
    );
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function saveAnamneseAction(
  input: unknown,
): Promise<ActionResult<AnamneseDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const parsed = anamneseSaveSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);
    const { organizationId } = await requireOrgFeatureWrite("anamnese");
    const saved = await saveAnamnese(
      organizationId,
      parsed.data.patientId,
      parsed.data.formId,
      parsed.data.data,
    );
    if (!saved) return fail("Paciente não encontrado");
    revalidateAnamnese(parsed.data.formId, parsed.data.patientId);
    return ok(saved);
  } catch (error) {
    return handleError(error);
  }
}
