import { deleteManagedImage, savePatientPhotoImage } from "@/shared/lib/media";
import {
  isManagedUploadUrl,
  isMediaUploadMimeType,
} from "@/shared/lib/media/media.constants";
import { toPatientDTO } from "./_lib/mappers";
import { patientRepository } from "./patient.repository";
import type { PatientFormInput, UpdatePatientInput } from "./patient.schema";
import type { PatientDetailDTO, PatientStatus } from "./patient.types";

export async function listPatients(
  organizationId: string,
  opts?: { status?: PatientStatus | null; search?: string },
) {
  const rows = await patientRepository.findMany(organizationId, opts);
  return rows.map(toPatientDTO);
}

export async function getPatientDetail(
  organizationId: string,
  id: string,
): Promise<PatientDetailDTO | null> {
  const row = await patientRepository.findById(organizationId, id);
  if (!row) return null;

  return {
    patient: toPatientDTO(row),
  };
}

export async function createPatient(
  organizationId: string,
  data: PatientFormInput,
) {
  const row = await patientRepository.create(organizationId, data);
  if (!row) {
    throw new Error("Responsável não encontrado.");
  }
  return toPatientDTO(row);
}

export async function updatePatient(
  organizationId: string,
  id: string,
  data: Omit<UpdatePatientInput, "id">,
) {
  const row = await patientRepository.update(organizationId, id, data);
  return row ? toPatientDTO(row) : null;
}

export async function setPatientStatus(
  organizationId: string,
  id: string,
  status: PatientStatus,
) {
  const row = await patientRepository.updateStatus(organizationId, id, status);
  return row ? toPatientDTO(row) : null;
}

export async function setPatientMembers(
  organizationId: string,
  patientId: string,
  memberIds: string[],
) {
  const row = await patientRepository.setMembers(
    organizationId,
    patientId,
    memberIds,
  );
  return row ? toPatientDTO(row) : null;
}

export async function savePatientPhoto(
  organizationId: string,
  patientId: string,
  file: File,
) {
  if (!isMediaUploadMimeType(file.type)) {
    throw new Error("Escolha uma imagem PNG, JPEG ou WebP");
  }

  const existing = await patientRepository.findById(organizationId, patientId);
  if (!existing) return null;

  const previous = existing.photoUrl?.trim() || null;
  const photoUrl = await savePatientPhotoImage(patientId, file);
  const row = await patientRepository.updatePhotoUrl(
    organizationId,
    patientId,
    photoUrl,
  );

  if (
    previous &&
    isManagedUploadUrl(previous, "patients") &&
    previous !== photoUrl
  ) {
    await deleteManagedImage(previous);
  }

  return row ? toPatientDTO(row) : null;
}

export async function removePatientPhoto(
  organizationId: string,
  patientId: string,
) {
  const existing = await patientRepository.findById(organizationId, patientId);
  if (!existing) return null;

  const previous = existing.photoUrl?.trim() || null;
  const row = await patientRepository.updatePhotoUrl(
    organizationId,
    patientId,
    null,
  );

  if (previous && isManagedUploadUrl(previous, "patients")) {
    await deleteManagedImage(previous);
  }

  return row ? toPatientDTO(row) : null;
}

export async function deletePatient(organizationId: string, id: string) {
  const row = await patientRepository.delete(organizationId, id);
  if (!row) return null;

  const previous = row.photoUrl?.trim() || null;
  if (previous && isManagedUploadUrl(previous, "patients")) {
    await deleteManagedImage(previous).catch(() => undefined);
  }

  return toPatientDTO(row);
}
