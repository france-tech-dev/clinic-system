import type { EvaluationDTO } from "@/features/patient/patient.types";
import type { PrintBranding } from "@/features/settings/settings.types";
import type { RoteiroCategory } from "@/shared/constants/roteiros";

export type PatientReportMode = "full" | "anamnese" | "evaluation" | "roteiro";

export type PatientReportRoteiro = {
  label: string;
  category: RoteiroCategory;
  notes: string;
};

export type PatientReportPlanItem = {
  exerciseTitle: string;
  objective: string;
};

export type PatientReportSessionNote = {
  date: string;
  status: string;
  atividades: string;
  observacoes?: string;
};

export type PatientReportPayload = {
  mode: PatientReportMode;
  patientName: string;
  signature: string;
  branding: PrintBranding;
  evaluations: EvaluationDTO[];
  selectedEvaluation: EvaluationDTO | null;
  anamneseData: Record<string, unknown>;
  planItems: PatientReportPlanItem[];
  sessionNotes: PatientReportSessionNote[];
  roteiro: PatientReportRoteiro | null;
};
