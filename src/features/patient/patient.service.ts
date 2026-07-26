import { patientRepository } from "./patient.repository";
import type {
  EvaluationFormInput,
  PatientFormInput,
  RoteiroNoteSaveInput,
  SessionFormInput,
  UpdatePatientInput,
} from "./patient.schema";
import type { PatientDetailDTO, PatientStatus } from "./patient.types";
import {
  toEvaluationDTO,
  toLinkableAppointmentDTO,
  toPatientDTO,
  toRoteiroNoteDTO,
  toSessionDTO,
} from "./_lib/mappers";

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
    evaluations: row.evaluations.map(toEvaluationDTO),
    sessionNotes: row.sessionNotes.map(toSessionDTO),
    appointments: row.appointments.map(toLinkableAppointmentDTO),
    roteiroNotes: row.roteiroNotes.map(toRoteiroNoteDTO),
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

export async function deletePatient(organizationId: string, id: string) {
  const row = await patientRepository.delete(organizationId, id);
  return row ? toPatientDTO(row) : null;
}

export async function resolveAuthorMemberId(
  organizationId: string,
  userId: string,
): Promise<string | null> {
  const member = await patientRepository.findMemberByUserId(
    organizationId,
    userId,
  );
  return member?.id ?? null;
}

export async function createEvaluation(
  organizationId: string,
  data: EvaluationFormInput,
  memberId: string | null,
) {
  const row = await patientRepository.createEvaluation(
    organizationId,
    data,
    memberId,
  );
  return row ? toEvaluationDTO(row) : null;
}

export async function updateEvaluation(
  organizationId: string,
  id: string,
  data: EvaluationFormInput,
) {
  const row = await patientRepository.updateEvaluation(
    organizationId,
    id,
    data,
  );
  return row ? toEvaluationDTO(row) : null;
}

export async function deleteEvaluation(organizationId: string, id: string) {
  return patientRepository.deleteEvaluation(organizationId, id);
}

export async function createSessionNote(
  organizationId: string,
  data: SessionFormInput,
  memberId: string | null,
) {
  const row = await patientRepository.createSession(
    organizationId,
    data,
    memberId,
  );
  return row ? toSessionDTO(row) : null;
}

export async function updateSessionNote(
  organizationId: string,
  id: string,
  data: SessionFormInput,
) {
  const row = await patientRepository.updateSession(organizationId, id, data);
  return row ? toSessionDTO(row) : null;
}

export async function deleteSessionNote(organizationId: string, id: string) {
  return patientRepository.deleteSession(organizationId, id);
}

export async function listRoteiroNotes(
  organizationId: string,
  patientId: string,
) {
  const rows = await patientRepository.listRoteiroNotes(
    organizationId,
    patientId,
  );
  return rows ? rows.map(toRoteiroNoteDTO) : null;
}

export async function saveRoteiroNote(
  organizationId: string,
  data: RoteiroNoteSaveInput,
) {
  const row = await patientRepository.upsertRoteiroNote(organizationId, data);
  return row ? toRoteiroNoteDTO(row) : null;
}
