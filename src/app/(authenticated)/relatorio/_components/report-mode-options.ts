import type { PatientReportMode } from "@/features/patient/_lib/pdf/types";

export const REPORT_MODES: { value: PatientReportMode; label: string }[] = [
  { value: "full", label: "Prontuário completo" },
  { value: "anamnese", label: "Anamnese" },
  { value: "evaluation", label: "Avaliação" },
  { value: "roteiro", label: "Roteiro clínico" },
];
