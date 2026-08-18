import type { ClinicalEvaluationDTO } from "@/features/patient/patient.types";
import type { PrintBranding } from "@/shared/types/professional";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import type { ClinicalEvaluationReportOptions } from "./clinical-evaluation-report-options";

export type PatientReportMode = "full" | "evaluation";

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
  evaluationReportOptions: ClinicalEvaluationReportOptions | null;
};
