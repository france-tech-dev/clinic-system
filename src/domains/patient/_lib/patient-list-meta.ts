import type { PatientDTO } from "@/domains/patient/patient.types";
import { formatDateBR } from "@/shared/lib/date/format-date-br";

export function formatPatientListMeta(
  patient: Pick<
    PatientDTO,
    "assessmentsCount" | "evolutionsCount" | "lastAssessmentDate"
  >,
): string {
  let meta = `${patient.assessmentsCount ?? 0} avaliações · ${patient.evolutionsCount ?? 0} evoluções`;

  if (patient.lastAssessmentDate) {
    meta += ` · última aval. ${formatDateBR(patient.lastAssessmentDate)}`;
  }

  return meta;
}
