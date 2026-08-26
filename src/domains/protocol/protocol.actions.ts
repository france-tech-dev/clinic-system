"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
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
  ProtocolEvaluationDTO,
  ProtocolEvaluationComparisonDTO,
  ProtocolEvaluationPreviewDTO,
} from "./protocol.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidateProtocol(protocolId: string, patientId?: string) {
  revalidatePath(paths.avaliacoes.byId(protocolId));
  if (patientId) revalidatePath(paths.paciente(patientId));
}

export async function listProtocolEvaluationsAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO[]>> {
  try {
    await requirePermission({ project: ["read"] });
    const parsed = listProtocolEvaluationsSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgId();
    const data = await listProtocolEvaluations(
      organizationId,
      parsed.data.patientId,
      parsed.data.protocolId,
    );
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function getProtocolEvaluationAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const parsed = protocolEvaluationIdSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgId();
    const data = await getProtocolEvaluation(organizationId, parsed.data.id);
    if (!data) return fail("Avaliação não encontrada");
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function getProtocolEvaluationPreviewAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationPreviewDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const parsed = protocolEvaluationIdSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgId();
    const data = await getProtocolEvaluationPreview(
      organizationId,
      parsed.data.id,
    );
    if (!data) return fail("Avaliação não encontrada");
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function saveProtocolInterpretationAIAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = saveProtocolInterpretationAISchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);

    const { organizationId } = await requireOrgFeatureWrite("ai");
    const data = await saveProtocolInterpretationAI(
      organizationId,
      parsed.data.id,
      parsed.data.interpretationAI,
    );
    if (!data) return fail("Avaliação não encontrada");

    revalidateProtocol(data.protocolId, data.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function createProtocolEvaluationAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const parsed = protocolEvaluationFormSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);

    const { organizationId, userId } =
      await requireOrgFeatureWrite("avaliacoes");
    const memberId = await resolveProtocolAuthorMemberId(
      organizationId,
      userId,
    );
    const data = await createProtocolEvaluation(
      organizationId,
      parsed.data,
      memberId,
    );
    if (!data) return fail("Paciente não encontrado");

    revalidateProtocol(parsed.data.protocolId, parsed.data.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProtocolEvaluationAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = updateProtocolEvaluationSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);

    const { organizationId } = await requireOrgFeatureWrite("avaliacoes");
    const data = await updateProtocolEvaluation(organizationId, parsed.data);
    if (!data) return fail("Avaliação não encontrada");

    revalidateProtocol(data.protocolId, parsed.data.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteProtocolEvaluationAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationDTO>> {
  try {
    await requirePermission({ project: ["delete"] });
    const parsed = protocolEvaluationIdSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgFeatureWrite("avaliacoes");
    const existing = await getProtocolEvaluation(
      organizationId,
      parsed.data.id,
    );
    if (!existing) return fail("Avaliação não encontrada");

    const data = await deleteProtocolEvaluation(organizationId, parsed.data.id);
    if (!data) return fail("Avaliação não encontrada");

    revalidateProtocol(existing.protocolId, existing.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function compareProtocolEvaluationsAction(
  input: unknown,
): Promise<ActionResult<ProtocolEvaluationComparisonDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const parsed = compareProtocolEvaluationsSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgId();
    const data = await compareProtocolEvaluations(
      organizationId,
      parsed.data.baselineId,
      parsed.data.followUpId,
    );
    if (!data) return fail("Não foi possível comparar as avaliações");
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
