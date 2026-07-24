"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  anamneseSaveSchema,
  evaluationFormSchema,
  evaluationIdSchema,
  patientFormSchema,
  patientIdSchema,
  patientStatusSchema,
  roteiroNoteSaveSchema,
  sessionFormSchema,
  sessionIdSchema,
  updateEvaluationSchema,
  updatePatientSchema,
  updateSessionNoteSchema,
} from "./patient.schema";
import {
  createEvaluation,
  createPatient,
  createSessionNote,
  deleteEvaluation,
  deletePatient,
  deleteSessionNote,
  resolveAuthorMemberId,
  getPatientDetail,
  listPatients,
  saveAnamnese,
  saveRoteiroNote,
  setPatientStatus,
  updateEvaluation,
  updatePatient,
  updateSessionNote,
} from "./patient.service";
import type {
  EvaluationDTO,
  PatientDetailDTO,
  PatientDTO,
  RoteiroNoteDTO,
  SessionNoteDTO,
} from "./patient.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error && error.message) {
    if (error.message.includes("Responsável")) {
      return fail(error.message);
    }
  }
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidatePatient(id?: string) {
  revalidatePath(paths.pacientes);
  revalidatePath(paths.painel);
  revalidatePath(paths.agenda);
  if (id) revalidatePath(paths.paciente(id));
}

export async function listPatientsAction(opts?: {
  status?: "ativo" | "alta" | "pausado" | null;
  search?: string;
}): Promise<ActionResult<PatientDTO[]>> {
  try {
    const { organizationId } = await requireOrgId();
    return ok(await listPatients(organizationId, opts));
  } catch (error) {
    return handleError(error);
  }
}

export async function getPatientDetailAction(
  id: string,
): Promise<ActionResult<PatientDetailDTO>> {
  try {
    const { organizationId } = await requireOrgId();
    const detail = await getPatientDetail(organizationId, id);
    if (!detail) return fail("Paciente não encontrado");
    return ok(detail);
  } catch (error) {
    return handleError(error);
  }
}

export async function createPatientAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    const parsed = patientFormSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgId();
    const data = await createPatient(organizationId, parsed.data);
    revalidatePatient();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updatePatientAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    const parsed = updatePatientSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgId();
    const { id, ...rest } = parsed.data;
    const data = await updatePatient(organizationId, id, rest);
    if (!data) return fail("Paciente não encontrado");
    revalidatePatient(id);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function setPatientStatusAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    const parsed = patientStatusSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");
    const { organizationId } = await requireOrgId();
    const data = await setPatientStatus(
      organizationId,
      parsed.data.id,
      parsed.data.status,
    );
    if (!data) return fail("Paciente não encontrado");
    revalidatePatient(parsed.data.id);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deletePatientAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    const parsed = patientIdSchema.safeParse(input);
    if (!parsed.success) return fail("ID inválido");
    const { organizationId } = await requireOrgId();
    const data = await deletePatient(organizationId, parsed.data.id);
    if (!data) return fail("Paciente não encontrado");
    revalidatePatient();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function createEvaluationAction(
  input: unknown,
): Promise<ActionResult<EvaluationDTO>> {
  try {
    const parsed = evaluationFormSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId, userId } = await requireOrgId();
    const memberId = await resolveAuthorMemberId(organizationId, userId);
    const data = await createEvaluation(organizationId, parsed.data, memberId);
    if (!data) return fail("Paciente não encontrado");
    revalidatePatient(parsed.data.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateEvaluationAction(
  input: unknown,
): Promise<ActionResult<EvaluationDTO>> {
  try {
    const parsed = updateEvaluationSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgId();
    const { id, ...rest } = parsed.data;
    const data = await updateEvaluation(organizationId, id, rest);
    if (!data) return fail("Avaliação não encontrada");
    revalidatePatient(rest.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteEvaluationAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = evaluationIdSchema.safeParse(input);
    if (!parsed.success) return fail("ID inválido");
    const { organizationId } = await requireOrgId();
    const removed = await deleteEvaluation(organizationId, parsed.data.id);
    if (!removed) return fail("Avaliação não encontrada");
    revalidatePatient(removed.patientId);
    return ok({ id: removed.id });
  } catch (error) {
    return handleError(error);
  }
}

export async function saveAnamneseAction(
  input: unknown,
): Promise<ActionResult<{ patientId: string }>> {
  try {
    const parsed = anamneseSaveSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);
    const { organizationId } = await requireOrgId();
    const saved = await saveAnamnese(
      organizationId,
      parsed.data.patientId,
      parsed.data.data,
    );
    if (!saved) return fail("Paciente não encontrado");
    revalidatePatient(parsed.data.patientId);
    return ok({ patientId: parsed.data.patientId });
  } catch (error) {
    return handleError(error);
  }
}

export async function createSessionAction(
  input: unknown,
): Promise<ActionResult<SessionNoteDTO>> {
  try {
    const parsed = sessionFormSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId, userId } = await requireOrgId();
    const memberId = await resolveAuthorMemberId(organizationId, userId);
    const data = await createSessionNote(organizationId, parsed.data, memberId);
    if (!data) {
      return fail("Agendamento não encontrado ou já possui evolução");
    }
    revalidatePatient(parsed.data.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateSessionAction(
  input: unknown,
): Promise<ActionResult<SessionNoteDTO>> {
  try {
    const parsed = updateSessionNoteSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgId();
    const { id, ...rest } = parsed.data;
    const data = await updateSessionNote(organizationId, id, rest);
    if (!data) {
      return fail("Evolução ou agendamento não encontrado");
    }
    revalidatePatient(rest.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteSessionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    const parsed = sessionIdSchema.safeParse(input);
    if (!parsed.success) return fail("ID inválido");
    const { organizationId } = await requireOrgId();
    const removed = await deleteSessionNote(organizationId, parsed.data.id);
    if (!removed) return fail("Evolução não encontrada");
    revalidatePatient(removed.patientId);
    return ok({ id: removed.id });
  } catch (error) {
    return handleError(error);
  }
}

export async function saveRoteiroNoteAction(
  input: unknown,
): Promise<ActionResult<RoteiroNoteDTO>> {
  try {
    const parsed = roteiroNoteSaveSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgId();
    const data = await saveRoteiroNote(organizationId, parsed.data);
    if (!data) return fail("Paciente não encontrado");
    revalidatePatient(parsed.data.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
