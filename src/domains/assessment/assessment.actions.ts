"use server";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import {
  assessmentFormSchema,
  assessmentIdSchema,
  updateAssessmentSchema,
} from "./assessment.schema";
import {
  createAssessment,
  deleteAssessment,
  resolveAuthorMemberId,
  updateAssessment,
} from "./assessment.service";
import type { AssessmentDTO } from "./assessment.types";

function revalidatePatient(patientId: string) {
  revalidatePath(paths.paciente(patientId));
  revalidatePath(paths.pacientes);
}

export async function createAssessmentAction(
  input: unknown,
): Promise<ActionResult<AssessmentDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(assessmentFormSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const memberId = await resolveAuthorMemberId(organizationId, userId);
    const data = await createAssessment(organizationId, payload, memberId);
    if (!data) throw new AppError("Paciente não encontrado");
    revalidatePatient(payload.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updateAssessmentAction(
  input: unknown,
): Promise<ActionResult<AssessmentDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateAssessmentSchema, input);
    const { organizationId } = await requireOrgWrite();
    const { id, ...rest } = payload;
    const data = await updateAssessment(organizationId, id, rest);
    if (!data) throw new AppError("Avaliação não encontrada");
    revalidatePatient(rest.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteAssessmentAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission({ project: ["delete"] });
    const { id } = AppError.parse(assessmentIdSchema, input);
    const { organizationId } = await requireOrgWrite();
    const removed = await deleteAssessment(organizationId, id);
    if (!removed) throw new AppError("Avaliação não encontrada");
    revalidatePatient(removed.patientId);
    return ok({ id: removed.id });
  } catch (error) {
    return AppError.result(error);
  }
}
