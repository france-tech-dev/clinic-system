import type { AssessmentReportOptions } from "@/domains/assessment/_lib/pdf/assessment-report-options";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import type { PatientReportMode } from "@/domains/patient/_lib/pdf/report-meta";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import type { PrintBranding } from "@/shared/types/professional";

export type { PatientReportMode };

export type PatientReportEvolution = {
  date: string;
  time: string;
  status: string;
  activities: string;
  observations?: string;
};

/** Payload composto (patient + assessment + evolution) — vive em application/. */
export type PatientReportPayload = {
  mode: PatientReportMode;
  patientName: string;
  signature: string;
  branding: PrintBranding;
  assessments: AssessmentDTO[];
  selectedAssessment: AssessmentDTO | null;
  anamneseSections: PdfKeyValueSection[];
  evolutions: PatientReportEvolution[];
  assessmentReportOptions: AssessmentReportOptions | null;
};
