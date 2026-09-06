"use server";

import { requirePermission } from "@/server/auth/permissions";
import { findProxyMember } from "@/server/auth/proxy-member";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import {
  clinicalEvaluationFormSchema,
  clinicalEvaluationIdSchema,
  patientFormSchema,
  patientIdSchema,
  patientMembersSchema,
  patientStatusSchema,
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
  getPatientDetail,
  listPatients,
  resolveAuthorMemberId,
  setPatientMembers,
  setPatientStatus,
  updateClinicalEvaluation,
  updatePatient,
  updateSessionNote,
} from "./patient.service";
import type {
  ClinicalEvaluationDTO,
  PatientDetailDTO,
  PatientDTO,
  PatientStatus,
  SessionNoteDTO,
} from "./patient.types";

function revalidatePatient(id?: string) {
  revalidatePath(paths.pacientes);
  revalidatePath(paths.dashboard);
  revalidatePath(paths.agenda);
  if (id) revalidatePath(paths.paciente(id));
}

export async function listPatientsAction(opts?: {
  status?: PatientStatus | null;
  search?: string;
}): Promise<ActionResult<PatientDTO[]>> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    return ok(await listPatients(organizationId, opts));
  } catch (error) {
    return AppError.result(error);
  }
}

export async function getPatientDetailAction(
  id: string,
): Promise<ActionResult<PatientDetailDTO>> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    const detail = await getPatientDetail(organizationId, id);
    if (!detail) throw new AppError("Paciente não encontrado");
    return ok(detail);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function createPatientAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(patientFormSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const member = await findProxyMember(userId, organizationId);
    const memberIds = isLeadershipRole(member?.role ?? null)
      ? (payload.memberIds ?? [])
      : [];
    const data = await createPatient(organizationId, {
      ...payload,
      memberIds,
    });
    revalidatePatient();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updatePatientAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updatePatientSchema, input);
    const { organizationId } = await requireOrgWrite();
    const { id, ...rest } = payload;
    const data = await updatePatient(organizationId, id, rest);
    if (!data) throw new AppError("Paciente não encontrado");
    revalidatePatient(id);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function setPatientStatusAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(patientStatusSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const member = await findProxyMember(userId, organizationId);
    if (!isLeadershipRole(member?.role ?? null)) {
      throw new Error("Sem permissão.");
    }
    const data = await setPatientStatus(
      organizationId,
      payload.id,
      payload.status,
    );
    if (!data) throw new AppError("Paciente não encontrado");
    revalidatePatient(payload.id);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function setPatientMembersAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(patientMembersSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const member = await findProxyMember(userId, organizationId);
    if (!isLeadershipRole(member?.role ?? null)) {
      throw new Error("Sem permissão.");
    }
    const data = await setPatientMembers(
      organizationId,
      payload.patientId,
      payload.memberIds,
    );
    if (!data) throw new AppError("Paciente não encontrado");
    revalidatePatient(payload.patientId);
    revalidatePath(paths.profissionais);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deletePatientAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    await requirePermission({ project: ["delete"] });
    const { id } = AppError.parse(patientIdSchema, input);
    const { organizationId } = await requireOrgWrite();
    const data = await deletePatient(organizationId, id);
    if (!data) throw new AppError("Paciente não encontrado");
    revalidatePatient();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function createClinicalEvaluationAction(
  input: unknown,
): Promise<ActionResult<ClinicalEvaluationDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(clinicalEvaluationFormSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const memberId = await resolveAuthorMemberId(organizationId, userId);
    const data = await createClinicalEvaluation(
      organizationId,
      payload,
      memberId,
    );
    if (!data) throw new AppError("Paciente não encontrado");
    revalidatePatient(payload.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updateClinicalEvaluationAction(
  input: unknown,
): Promise<ActionResult<ClinicalEvaluationDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateClinicalEvaluationSchema, input);
    const { organizationId } = await requireOrgWrite();
    const { id, ...rest } = payload;
    const data = await updateClinicalEvaluation(organizationId, id, rest);
    if (!data) throw new AppError("Avaliação não encontrada");
    revalidatePatient(rest.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteClinicalEvaluationAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission({ project: ["delete"] });
    const { id } = AppError.parse(clinicalEvaluationIdSchema, input);
    const { organizationId } = await requireOrgWrite();
    const removed = await deleteClinicalEvaluation(organizationId, id);
    if (!removed) throw new AppError("Avaliação não encontrada");
    revalidatePatient(removed.patientId);
    return ok({ id: removed.id });
  } catch (error) {
    return AppError.result(error);
  }
}

export async function createSessionAction(
  input: unknown,
): Promise<ActionResult<SessionNoteDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(sessionFormSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const memberId = await resolveAuthorMemberId(organizationId, userId);
    const data = await createSessionNote(organizationId, payload, memberId);
    if (!data) {
      throw new AppError("Agendamento não encontrado ou já possui evolução");
    }
    revalidatePatient(payload.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updateSessionAction(
  input: unknown,
): Promise<ActionResult<SessionNoteDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateSessionNoteSchema, input);
    const { organizationId } = await requireOrgWrite();
    const { id, ...rest } = payload;
    const data = await updateSessionNote(organizationId, id, rest);
    if (!data) {
      throw new AppError("Evolução ou agendamento não encontrado");
    }
    revalidatePatient(rest.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteSessionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission({ project: ["delete"] });
    const { id } = AppError.parse(sessionIdSchema, input);
    const { organizationId } = await requireOrgWrite();
    const removed = await deleteSessionNote(organizationId, id);
    if (!removed) throw new AppError("Evolução não encontrada");
    revalidatePatient(removed.patientId);
    return ok({ id: removed.id });
  } catch (error) {
    return AppError.result(error);
  }
}
