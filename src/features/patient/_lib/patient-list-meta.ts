import type { PatientDTO } from "@/features/patient/patient.types";
import { formatDateBR } from "@/shared/lib/format-date-br";

type PatientListMetaInput = Pick<
  PatientDTO,
  "clinicalEvaluationsCount" | "sessionsCount" | "lastClinicalEvaluationDate"
>;

export function formatPatientListMeta(patient: PatientListMetaInput): string {
  let meta = `${patient.clinicalEvaluationsCount ?? 0} avaliações · ${patient.sessionsCount ?? 0} evoluções`;

  if (patient.lastClinicalEvaluationDate) {
    meta += ` · última aval. ${formatDateBR(patient.lastClinicalEvaluationDate)}`;
  }

  return meta;
}
