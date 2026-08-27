import { PatientStatus } from "@prisma/enums";

export const PATIENT_STATUS_LABEL = {
  [PatientStatus.ACTIVE]: "Ativo",
  [PatientStatus.DISCHARGED]: "Alta",
  [PatientStatus.PAUSED]: "Pausado",
} as const satisfies Record<PatientStatus, string>;

export function patientStatusLabel(status: PatientStatus): string {
  return PATIENT_STATUS_LABEL[status];
}

export const PATIENT_STATUS_OPTIONS = [
  PatientStatus.ACTIVE,
  PatientStatus.PAUSED,
  PatientStatus.DISCHARGED,
] as const;

export const PATIENT_STATUSES = [
  PatientStatus.ACTIVE,
  PatientStatus.DISCHARGED,
  PatientStatus.PAUSED,
] as const;
