export type PatientDetailTab =
  "avaliacao" | "anamnese" | "evolucoes" | "links-publicos";

export const PATIENT_DETAIL_TABS = [
  ["avaliacao", "Avaliação"],
  ["anamnese", "Anamnese"],
  ["evolucoes", "Evoluções"],
  ["links-publicos", "Links públicos"],
] as const satisfies ReadonlyArray<[PatientDetailTab, string]>;
