import type { PatientReportMode } from "./types";

export function getPatientReportTitle(
  mode: PatientReportMode,
  roteiroLabel?: string,
): string {
  switch (mode) {
    case "anamnese":
      return "Anamnese de Terapia Ocupacional";
    case "evaluation":
      return "Relatório de Avaliação Ocupacional";
    case "roteiro":
      return roteiroLabel ? `Roteiro — ${roteiroLabel}` : "Roteiro clínico";
    case "full":
    default:
      return "Prontuário Completo";
  }
}

export function buildPatientReportFilename(
  patientName: string,
  mode: PatientReportMode,
  roteiroLabel?: string,
): string {
  const title = getPatientReportTitle(mode, roteiroLabel);
  const slug = `${patientName}-${title}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
  return `${slug || "relatorio"}.pdf`;
}
