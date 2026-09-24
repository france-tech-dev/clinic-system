import type { AssessmentReportOptions } from "@/domains/assessment/_lib/pdf/assessment-report-options";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import type { PrintBranding } from "@/shared/types/professional";

export type PatientReportMode = "full" | "evaluation";

export type PatientReportEvolution = {
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
  assessments: AssessmentDTO[];
  selectedAssessment: AssessmentDTO | null;
  /** Blocos de anamnese já achatados (orquestrados no app/). */
  anamneseSections: PdfKeyValueSection[];
  evolutions: PatientReportEvolution[];
  assessmentReportOptions: AssessmentReportOptions | null;
};
