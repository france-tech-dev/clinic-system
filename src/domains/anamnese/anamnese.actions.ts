"use server";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import { anamneseSaveSchema, getAnamneseSchema } from "./anamnese.schema";
import { getAnamnese, saveAnamnese } from "./anamnese.service";
import type { AnamneseDTO } from "./anamnese.types";

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
    const payload = AppError.parse(getAnamneseSchema, input);
    const { organizationId } = await requireOrgId();
    const data = await getAnamnese(
      organizationId,
      payload.patientId,
      payload.formId,
    );
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function saveAnamneseAction(
  input: unknown,
): Promise<ActionResult<AnamneseDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(anamneseSaveSchema, input);
    const { organizationId } = await requireOrgFeatureWrite("anamnese");
    const saved = await saveAnamnese(
      organizationId,
      payload.patientId,
      payload.formId,
      payload.data,
    );
    if (!saved) throw new AppError("Paciente não encontrado");
    revalidateAnamnese(payload.formId, payload.patientId);
    return ok(saved);
  } catch (error) {
    return AppError.result(error);
  }
}
