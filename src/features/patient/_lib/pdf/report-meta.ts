import type { PatientReportMode } from "./types";

export function getPatientReportTitle(mode: PatientReportMode): string {
  switch (mode) {
    case "evaluation":
      return "Relatório de Avaliação Ocupacional";
    case "full":
    default:
      return "Prontuário Completo";
  }
}

export function buildPatientReportFilename(
  patientName: string,
  mode: PatientReportMode,
): string {
  const title = getPatientReportTitle(mode);
  const slug = `${patientName}-${title}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
  return `${slug || "relatorio"}.pdf`;
}
