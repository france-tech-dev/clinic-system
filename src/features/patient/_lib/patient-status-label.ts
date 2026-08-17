import type { PatientStatus } from "../patient.types";

export const PATIENT_STATUS_LABEL: Record<PatientStatus, string> = {
  active: "Ativo",
  discharged: "Alta",
  paused: "Pausado",
};

export const PATIENT_STATUS_OPTIONS: PatientStatus[] = [
  "active",
  "paused",
  "discharged",
];
