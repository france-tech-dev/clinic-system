import type { EvaluationDTO } from "@/features/patient/patient.types";
import type { PrintBranding } from "@/shared/types/professional";
import type { RoteiroCategory } from "@/shared/constants/roteiros";
import type { EvaluationReportOptions } from "./evaluation-report-options";

export type PatientReportMode = "full" | "anamnese" | "evaluation" | "roteiro";

export type PatientReportRoteiro = {
  label: string;
  category: RoteiroCategory;
  notes: string;
};

export type PatientReportSessionNote = {
  date: string;
  time: string;
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
  sessionNotes: PatientReportSessionNote[];
  roteiro: PatientReportRoteiro | null;
  evaluationReportOptions: EvaluationReportOptions | null;
};
