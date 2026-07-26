export type PatientDetailTab =
  | "avaliacao"
  | "roteiros"
  | "anamnese"
  | "evolucoes";

export const PATIENT_DETAIL_TABS = [
  ["avaliacao", "Avaliação"],
  ["roteiros", "Roteiros"],
  ["anamnese", "Anamnese"],
  ["evolucoes", "Evoluções"],
] as const satisfies ReadonlyArray<[PatientDetailTab, string]>;
