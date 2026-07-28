import type { ClinicalEvaluationDTO } from "@/features/patient/patient.types";
import type { PrintBranding } from "@/shared/types/professional";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import type { RoteiroCategory } from "@/shared/constants/roteiros";
import type { ClinicalEvaluationReportOptions } from "./clinical-evaluation-report-options";

export type PatientReportMode = "full" | "evaluation" | "roteiro";

export type PatientReportRoteiro = {
  label: string;
  category: RoteiroCategory;
  notes: string;
};

export type PatientReportSessionNote = {
  date: string;
  time: string;
  status: string;
  activities: string;
  observations?: string;
};

export type PatientReportPayload = {
  mode: PatientReportMode;
  patientName: string;
  signature: string;
  branding: PrintBranding;
  clinicalEvaluations: ClinicalEvaluationDTO[];
  selectedEvaluation: ClinicalEvaluationDTO | null;
  /** Blocos de anamnese já achatados (orquestrados no app/). */
  anamneseSections: PdfKeyValueSection[];
  sessionNotes: PatientReportSessionNote[];
  roteiro: PatientReportRoteiro | null;
  evaluationReportOptions: ClinicalEvaluationReportOptions | null;
};
