"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/permissions";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  clinicalEvaluationFormSchema,
  clinicalEvaluationIdSchema,
  patientFormSchema,
  patientIdSchema,
  patientStatusSchema,
  roteiroNoteSaveSchema,
  sessionFormSchema,
  sessionIdSchema,
  updateClinicalEvaluationSchema,
  updatePatientSchema,
  updateSessionNoteSchema,
} from "./patient.schema";
import {
  createClinicalEvaluation,
  createPatient,
  createSessionNote,
  deleteClinicalEvaluation,
  deletePatient,
  deleteSessionNote,
  resolveAuthorMemberId,
  getPatientDetail,
  listPatients,
  listRoteiroNotes,
  saveRoteiroNote,
  setPatientStatus,
  updateClinicalEvaluation,
  updatePatient,
  updateSessionNote,
} from "./patient.service";
import type {
  ClinicalEvaluationDTO,
  PatientDetailDTO,
  PatientDTO,
  RoteiroNoteDTO,
  SessionNoteDTO,
} from "./patient.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidatePatient(id?: string) {
  revalidatePath(paths.pacientes);
  revalidatePath(paths.dashboard);
  revalidatePath(paths.agenda);
  if (id) revalidatePath(paths.paciente(id));
}

export async function listPatientsAction(opts?: {
  status?: "active" | "discharged" | "paused" | null;
  search?: string;
}): Promise<ActionResult<PatientDTO[]>> {
  try {
    await requirePermission({ project: ["read"] });
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
    await requirePermission({ project: ["read"] });
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
    await requirePermission({ project: ["create"] });
    const parsed = patientFormSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgWrite();
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
    await requirePermission({ project: ["update"] });
    const parsed = updatePatientSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgWrite();
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
    await requirePermission({ project: ["update"] });
    const parsed = patientStatusSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");
    const { organizationId } = await requireOrgWrite();
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
    await requirePermission({ project: ["delete"] });
    const parsed = patientIdSchema.safeParse(input);
    if (!parsed.success) return fail("ID inválido");
    const { organizationId } = await requireOrgWrite();
    const data = await deletePatient(organizationId, parsed.data.id);
    if (!data) return fail("Paciente não encontrado");
    revalidatePatient();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function createClinicalEvaluationAction(
  input: unknown,
): Promise<ActionResult<ClinicalEvaluationDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const parsed = clinicalEvaluationFormSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId, userId } = await requireOrgWrite();
    const memberId = await resolveAuthorMemberId(organizationId, userId);
    const data = await createClinicalEvaluation(
      organizationId,
      parsed.data,
      memberId,
    );
    if (!data) return fail("Paciente não encontrado");
    revalidatePatient(parsed.data.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateClinicalEvaluationAction(
  input: unknown,
): Promise<ActionResult<ClinicalEvaluationDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = updateClinicalEvaluationSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgWrite();
    const { id, ...rest } = parsed.data;
    const data = await updateClinicalEvaluation(organizationId, id, rest);
    if (!data) return fail("Avaliação não encontrada");
    revalidatePatient(rest.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteClinicalEvaluationAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission({ project: ["delete"] });
    const parsed = clinicalEvaluationIdSchema.safeParse(input);
    if (!parsed.success) return fail("ID inválido");
    const { organizationId } = await requireOrgWrite();
    const removed = await deleteClinicalEvaluation(
      organizationId,
      parsed.data.id,
    );
    if (!removed) return fail("Avaliação não encontrada");
    revalidatePatient(removed.patientId);
    return ok({ id: removed.id });
  } catch (error) {
    return handleError(error);
  }
}

export async function createSessionAction(
  input: unknown,
): Promise<ActionResult<SessionNoteDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const parsed = sessionFormSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId, userId } = await requireOrgWrite();
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
    await requirePermission({ project: ["update"] });
    const parsed = updateSessionNoteSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgWrite();
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
    await requirePermission({ project: ["delete"] });
    const parsed = sessionIdSchema.safeParse(input);
    if (!parsed.success) return fail("ID inválido");
    const { organizationId } = await requireOrgWrite();
    const removed = await deleteSessionNote(organizationId, parsed.data.id);
    if (!removed) return fail("Evolução não encontrada");
    revalidatePatient(removed.patientId);
    return ok({ id: removed.id });
  } catch (error) {
    return handleError(error);
  }
}

export async function listRoteiroNotesAction(
  patientId: string,
): Promise<ActionResult<RoteiroNoteDTO[]>> {
  try {
    await requirePermission({ project: ["read"] });
    if (!patientId) return fail("Paciente não informado");
    const { organizationId } = await requireOrgId();
    const data = await listRoteiroNotes(organizationId, patientId);
    if (!data) return fail("Paciente não encontrado");
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function saveRoteiroNoteAction(
  input: unknown,
): Promise<ActionResult<RoteiroNoteDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = roteiroNoteSaveSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }
    const { organizationId } = await requireOrgWrite();
    const data = await saveRoteiroNote(organizationId, parsed.data);
    if (!data) return fail("Paciente não encontrado");
    revalidatePatient(parsed.data.patientId);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
