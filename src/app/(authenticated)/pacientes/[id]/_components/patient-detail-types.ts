export type PatientDetailTab = "plano" | "avaliacao" | "anamnese" | "evolucoes";

export type AvaliacaoView = "lista" | "roteiro";

export const PATIENT_DETAIL_TABS = [
  ["plano", "Plano de Atividades"],
  ["avaliacao", "Avaliação"],
  ["anamnese", "Anamnese"],
  ["evolucoes", "Evoluções"],
] as const satisfies ReadonlyArray<[PatientDetailTab, string]>;
