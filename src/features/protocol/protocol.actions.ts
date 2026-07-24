"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  compareProtocolAssessmentsSchema,
  listProtocolAssessmentsSchema,
  protocolAssessmentFormSchema,
  protocolAssessmentIdSchema,
  updateProtocolAssessmentSchema,
} from "./protocol.schema";
import {
  compareProtocolAssessments,
  createProtocolAssessment,
  deleteProtocolAssessment,
  getProtocolAssessment,
  listProtocolAssessments,
  resolveProtocolAuthorMemberId,
  updateProtocolAssessment,
} from "./protocol.service";
import type {
  ProtocolAssessmentDTO,
  ProtocolComparisonDTO,
} from "./protocol.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidateProtocol(protocolId: string, patientId?: string) {
  revalidatePath(paths.avaliacoes.byId(protocolId));
  if (patientId) revalidatePath(paths.paciente(patientId));
}

export async function listProtocolAssessmentsAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO[]>> {
  try {
    const parsed = listProtocolAssessmentsSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgId();
    const data = await listProtocolAssessments(
      organizationId,
      parsed.data.patientId,
      parsed.data.protocolId,
    );
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function createProtocolAssessmentAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO>> {
  try {
    const parsed = protocolAssessmentFormSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);

    const { organizationId, userId } = await requireOrgId();
    const memberId = await resolveProtocolAuthorMemberId(
      organizationId,
      userId,
    );
    const data = await createProtocolAssessment(
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

export async function updateProtocolAssessmentAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO>> {
  try {
    const parsed = updateProtocolAssessmentSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);

    const { organizationId } = await requireOrgId();
    const data = await updateProtocolAssessment(organizationId, parsed.data);
    if (!data) return fail("Avaliação não encontrada");

    revalidateProtocol(data.protocolId, parsed.data.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteProtocolAssessmentAction(
  input: unknown,
): Promise<ActionResult<ProtocolAssessmentDTO>> {
  try {
    const parsed = protocolAssessmentIdSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgId();
    const existing = await getProtocolAssessment(
      organizationId,
      parsed.data.id,
    );
    if (!existing) return fail("Avaliação não encontrada");

    const data = await deleteProtocolAssessment(organizationId, parsed.data.id);
    if (!data) return fail("Avaliação não encontrada");

    revalidateProtocol(existing.protocolId, existing.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function compareProtocolAssessmentsAction(
  input: unknown,
): Promise<ActionResult<ProtocolComparisonDTO>> {
  try {
    const parsed = compareProtocolAssessmentsSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgId();
    const data = await compareProtocolAssessments(
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
