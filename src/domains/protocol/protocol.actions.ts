"use server";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import {
  compareProtocolEvaluationsSchema,
  listProtocolEvaluationsSchema,
  protocolEvaluationFormSchema,
  protocolEvaluationIdSchema,
  saveProtocolInterpretationAISchema,
  updateProtocolEvaluationSchema,
} from "./protocol.schema";
import {
  compareProtocolEvaluations,
  createProtocolEvaluation,
  deleteProtocolEvaluation,
  getProtocolEvaluation,
  getProtocolEvaluationPreview,
  listProtocolEvaluations,
  resolveProtocolAuthorMemberId,
  saveProtocolInterpretationAI,
  updateProtocolEvaluation,
} from "./protocol.service";
import type {
  ProtocolEvaluationComparisonDTO,
  ProtocolEvaluationDTO,
  ProtocolEvaluationPreviewDTO,
} from "./protocol.types";

function revalidateProtocol(protocolId: string, patientId?: string) {
  revalidatePath(paths.avaliacoes.byId(protocolId));
  if (patientId) revalidatePath(paths.paciente(patientId));
}

export async function listProtocolEvaluationsAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO[]>> {
  try {
    await requirePermission({ project: ["read"] });
    const payload = AppError.parse(listProtocolEvaluationsSchema, input);

    const { organizationId } = await requireOrgId();
    const data = await listProtocolEvaluations(
      organizationId,
      payload.patientId,
      payload.protocolId,
    );
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function getProtocolEvaluationAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const payload = AppError.parse(protocolEvaluationIdSchema, input);

    const { organizationId } = await requireOrgId();
    const data = await getProtocolEvaluation(organizationId, payload.id);
    if (!data) throw new AppError("Avaliação não encontrada");
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function getProtocolEvaluationPreviewAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationPreviewDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const payload = AppError.parse(protocolEvaluationIdSchema, input);

    const { organizationId } = await requireOrgId();
    const data = await getProtocolEvaluationPreview(organizationId, payload.id);
    if (!data) throw new AppError("Avaliação não encontrada");
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function saveProtocolInterpretationAIAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(saveProtocolInterpretationAISchema, input);

    const { organizationId } = await requireOrgFeatureWrite("ai");
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

export async function createProtocolEvaluationAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(protocolEvaluationFormSchema, input);

    const { organizationId, userId } =
      await requireOrgFeatureWrite("avaliacoes");
    const memberId = await resolveProtocolAuthorMemberId(
      organizationId,
      userId,
    );
    const data = await createProtocolEvaluation(
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

export async function updateProtocolEvaluationAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateProtocolEvaluationSchema, input);

    const { organizationId } = await requireOrgFeatureWrite("avaliacoes");
    const data = await updateProtocolEvaluation(organizationId, payload);
    if (!data) throw new AppError("Avaliação não encontrada");

    revalidateProtocol(data.protocolId, payload.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteProtocolEvaluationAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["delete"] });
    const payload = AppError.parse(protocolEvaluationIdSchema, input);

    const { organizationId } = await requireOrgFeatureWrite("avaliacoes");
    const existing = await getProtocolEvaluation(organizationId, payload.id);
    if (!existing) throw new AppError("Avaliação não encontrada");

    const data = await deleteProtocolEvaluation(organizationId, payload.id);
    if (!data) throw new AppError("Avaliação não encontrada");

    revalidateProtocol(existing.protocolId, existing.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function compareProtocolEvaluationsAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationComparisonDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const payload = AppError.parse(compareProtocolEvaluationsSchema, input);

    const { organizationId } = await requireOrgId();
    const data = await compareProtocolEvaluations(
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
