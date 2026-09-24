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
  patientFormSchema,
  patientIdSchema,
  patientMembersSchema,
  patientStatusSchema,
  updatePatientSchema,
} from "./patient.schema";
import {
  createPatient,
  deletePatient,
  getPatientDetail,
  listPatients,
  removePatientPhoto,
  savePatientPhoto,
  setPatientMembers,
  setPatientStatus,
  updatePatient,
} from "./patient.service";
import type {
  PatientDetailDTO,
  PatientDTO,
  PatientStatus,
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

export async function uploadPatientPhotoAction(
  formData: FormData,
): Promise<ActionResult<PatientDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const patientId = formData.get("patientId");
    const file = formData.get("photo");
    if (typeof patientId !== "string" || !patientId.trim()) {
      throw new AppError("Paciente inválido");
    }
    if (!(file instanceof File) || file.size === 0) {
      throw new AppError("Selecione uma imagem");
    }

    const { organizationId } = await requireOrgWrite();
    const data = await savePatientPhoto(organizationId, patientId.trim(), file);
    if (!data) throw new AppError("Paciente não encontrado");
    revalidatePatient(data.id);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function removePatientPhotoAction(
  input: unknown,
): Promise<ActionResult<PatientDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const { id } = AppError.parse(patientIdSchema, input);
    const { organizationId } = await requireOrgWrite();
    const data = await removePatientPhoto(organizationId, id);
    if (!data) throw new AppError("Paciente não encontrado");
    revalidatePatient(id);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}
