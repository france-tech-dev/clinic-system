import type { AssessmentReportOptions } from "@/domains/assessment/_lib/pdf/assessment-report-options";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import type { EvolutionDTO } from "@/domains/evolution/evolution.types";
import type { PatientDetailDTO } from "@/domains/patient/patient.types";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/shared/types/professional";
import {
  formatProfessionalSignature,
  resolveReportProfessional,
} from "@/shared/types/professional";
import type { PatientReportMode, PatientReportPayload } from "./types";

export type BuildPatientReportPayloadInput = {
  detail: PatientDetailDTO;
  assessments: AssessmentDTO[];
  evolutions: EvolutionDTO[];
  mode: PatientReportMode;
  branding: PrintBranding;
  /** Fallback da organização (Configurações). */
  professional: ProfessionalProfile;
  /** Assinatura do autor da avaliação (Member), se houver. */
  authorProfessional?: ProfessionalProfile | null;
  assessment?: AssessmentDTO | null;
  assessmentReportOptions?: AssessmentReportOptions | null;
  /** Secções de anamnese já resolvidas no app/. */
  anamneseSections?: PdfKeyValueSection[];
};

export function buildPatientReportPayload({
  detail,
  assessments,
  evolutions,
  mode,
  branding,
  professional,
  authorProfessional = null,
  assessment = null,
  assessmentReportOptions = null,
  anamneseSections = [],
}: BuildPatientReportPayloadInput): PatientReportPayload {
  const resolved = resolveReportProfessional(authorProfessional, professional);
  const signature = formatProfessionalSignature(resolved);

  const selectedAssessment =
    mode === "evaluation" ? (assessment ?? assessments[0] ?? null) : null;

  return {
    mode,
    patientName: detail.patient.name,
    signature,
    branding,
    assessments,
    selectedAssessment,
    anamneseSections: mode === "full" ? anamneseSections : [],
    evolutions: evolutions.map((s) => ({
      date: s.date,
      time: s.time,
      status: s.status,
      activities: s.activities,
      observations: s.observations,
    })),
    assessmentReportOptions:
      mode === "evaluation" ? assessmentReportOptions : null,
  };
}
