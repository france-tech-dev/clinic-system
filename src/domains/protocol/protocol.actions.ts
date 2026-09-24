"use server";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import {
  compareProtocolAssessmentsSchema,
  listProtocolAssessmentsSchema,
  protocolAssessmentFormSchema,
  protocolAssessmentIdSchema,
  saveProtocolInterpretationAISchema,
  updateProtocolAssessmentSchema,
} from "./protocol.schema";
import {
  compareProtocolAssessments,
  createProtocolAssessment,
  deleteProtocolAssessment,
  getProtocolAssessment,
  getProtocolAssessmentPreview,
  listProtocolAssessments,
  resolveProtocolAuthorMemberId,
  saveProtocolInterpretationAI,
  updateProtocolAssessment,
} from "./protocol.service";
import type {
  ProtocolAssessmentComparisonDTO,
  ProtocolAssessmentDTO,
  ProtocolAssessmentPreviewDTO,
} from "./protocol.types";

function revalidateProtocol(protocolId: string, patientId?: string) {
  revalidatePath(paths.avaliacoes.byId(protocolId));
  if (patientId) revalidatePath(paths.paciente(patientId));
}

export async function listProtocolAssessmentsAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO[]>> {
  try {
    await requirePermission({ project: ["read"] });
    const payload = AppError.parse(listProtocolAssessmentsSchema, input);

    const { organizationId } = await requireOrgId();
    const data = await listProtocolAssessments(
      organizationId,
      payload.patientId,
      payload.protocolId,
    );
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function getProtocolAssessmentAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const payload = AppError.parse(protocolAssessmentIdSchema, input);

    const { organizationId } = await requireOrgId();
    const data = await getProtocolAssessment(organizationId, payload.id);
    if (!data) throw new AppError("Avaliação não encontrada");
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function getProtocolAssessmentPreviewAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentPreviewDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const payload = AppError.parse(protocolAssessmentIdSchema, input);

    const { organizationId } = await requireOrgId();
    const data = await getProtocolAssessmentPreview(organizationId, payload.id);
    if (!data) throw new AppError("Avaliação não encontrada");
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function saveProtocolInterpretationAIAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(saveProtocolInterpretationAISchema, input);

    const { organizationId } = await requireOrgWrite();
    const data = await saveProtocolInterpretationAI(
      organizationId,
      payload.id,
      payload.interpretationAI,
    );
    if (!data) throw new AppError("Avaliação não encontrada");

    revalidateProtocol(data.protocolId, data.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function createProtocolAssessmentAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(protocolAssessmentFormSchema, input);

    const { organizationId, userId } =
      await requireOrgWrite();
    const memberId = await resolveProtocolAuthorMemberId(
      organizationId,
      userId,
    );
    const data = await createProtocolAssessment(
      organizationId,
      payload,
      memberId,
    );
    if (!data) throw new AppError("Paciente não encontrado");

    revalidateProtocol(payload.protocolId, payload.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updateProtocolAssessmentAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateProtocolAssessmentSchema, input);

    const { organizationId } = await requireOrgWrite();
    const data = await updateProtocolAssessment(organizationId, payload);
    if (!data) throw new AppError("Avaliação não encontrada");

    revalidateProtocol(data.protocolId, payload.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteProtocolAssessmentAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO>> {
  try {
    await requirePermission({ project: ["delete"] });
    const payload = AppError.parse(protocolAssessmentIdSchema, input);

    const { organizationId } = await requireOrgWrite();
    const existing = await getProtocolAssessment(organizationId, payload.id);
    if (!existing) throw new AppError("Avaliação não encontrada");

    const data = await deleteProtocolAssessment(organizationId, payload.id);
    if (!data) throw new AppError("Avaliação não encontrada");

    revalidateProtocol(existing.protocolId, existing.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function compareProtocolAssessmentsAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentComparisonDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const payload = AppError.parse(compareProtocolAssessmentsSchema, input);

    const { organizationId } = await requireOrgId();
    const data = await compareProtocolAssessments(
      organizationId,
      payload.baselineId,
      payload.followUpId,
    );
    if (!data) throw new AppError("Não foi possível comparar as avaliações");
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}
