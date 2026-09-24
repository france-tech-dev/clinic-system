import { toAssessmentDTO } from "./_lib/mappers";
import { assessmentRepository } from "./assessment.repository";
import type { AssessmentFormInput } from "./assessment.schema";

export async function listAssessmentsByPatient(
  organizationId: string,
  patientId: string,
) {
  const rows = await assessmentRepository.findByPatient(
    organizationId,
    patientId,
  );
  if (!rows) return null;
  return rows.map(toAssessmentDTO);
}

export async function resolveAuthorMemberId(
  organizationId: string,
  userId: string,
): Promise<string | null> {
  const member = await assessmentRepository.findMemberByUserId(
    organizationId,
    userId,
  );
  return member?.id ?? null;
}

export async function createAssessment(
  organizationId: string,
  data: AssessmentFormInput,
  memberId: string | null,
) {
  const row = await assessmentRepository.create(organizationId, data, memberId);
  return row ? toAssessmentDTO(row) : null;
}

export async function updateAssessment(
  organizationId: string,
  id: string,
  data: AssessmentFormInput,
) {
  const row = await assessmentRepository.update(organizationId, id, data);
  return row ? toAssessmentDTO(row) : null;
}

export async function deleteAssessment(organizationId: string, id: string) {
  return assessmentRepository.delete(organizationId, id);
}
