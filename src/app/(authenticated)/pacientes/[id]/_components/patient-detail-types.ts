export type PatientDetailTab =
  "avaliacao" | "anamnese" | "evolucoes" | "links-publicos";

export const PATIENT_DETAIL_TABS = [
  ["avaliacao", "Avaliação"],
  ["anamnese", "Anamnese"],
  ["evolucoes", "Evoluções"],
  ["links-publicos", "Links públicos"],
] as const satisfies ReadonlyArray<[PatientDetailTab, string]>;

const PATIENT_DETAIL_TAB_IDS = new Set<string>(
  PATIENT_DETAIL_TABS.map(([id]) => id),
);

export function parsePatientDetailTab(
  value: string | string[] | undefined,
): PatientDetailTab {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && PATIENT_DETAIL_TAB_IDS.has(raw)) {
    return raw as PatientDetailTab;
  }
  return "avaliacao";
}
