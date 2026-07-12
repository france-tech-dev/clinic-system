import type { PatientDTO } from "@/features/patient/patient.types";
import { formatDateBR } from "@/shared/lib/format-date-br";

type PatientListMetaInput = Pick<
  PatientDTO,
  "evaluationsCount" | "sessionsCount" | "lastEvaluationDate"
>;

export function formatPatientListMeta(patient: PatientListMetaInput): string {
  let meta = `${patient.evaluationsCount ?? 0} avaliações · ${patient.sessionsCount ?? 0} evoluções`;

  if (patient.lastEvaluationDate) {
    meta += ` · última aval. ${formatDateBR(patient.lastEvaluationDate)}`;
  }

  return meta;
}
