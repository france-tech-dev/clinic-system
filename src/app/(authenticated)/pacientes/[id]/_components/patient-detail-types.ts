export type PatientDetailTab = "avaliacao" | "anamnese" | "evolucoes";

export const PATIENT_DETAIL_TABS = [
  ["avaliacao", "Avaliação"],
  ["anamnese", "Anamnese"],
  ["evolucoes", "Evoluções"],
] as const satisfies ReadonlyArray<[PatientDetailTab, string]>;
