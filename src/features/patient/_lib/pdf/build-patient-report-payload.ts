import type { ClinicalEvaluationDTO, PatientDetailDTO } from "@/features/patient/patient.types";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/shared/types/professional";
import {
  formatProfessionalSignature,
  resolveReportProfessional,
} from "@/shared/types/professional";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import {
  roteiroById,
  roteiroCategoryByTick,
  type RoteiroId,
} from "@/shared/constants/roteiros";
import type { PatientReportMode, PatientReportPayload } from "./types";
import type { ClinicalEvaluationReportOptions } from "./clinical-evaluation-report-options";

export type BuildPatientReportPayloadInput = {
  detail: PatientDetailDTO;
  mode: PatientReportMode;
  branding: PrintBranding;
  /** Fallback da organização (Configurações). */
  professional: ProfessionalProfile;
  /** Assinatura do autor da avaliação (Member), se houver. */
  authorProfessional?: ProfessionalProfile | null;
  evaluation?: ClinicalEvaluationDTO | null;
  roteiro?: {
    roteiroId: RoteiroId;
    categoryTick: string;
  } | null;
  evaluationReportOptions?: ClinicalEvaluationReportOptions | null;
  /** Secções de anamnese já resolvidas no app/. */
  anamneseSections?: PdfKeyValueSection[];
};

export function buildPatientReportPayload({
  detail,
  mode,
  branding,
  professional,
  authorProfessional = null,
  evaluation = null,
  roteiro = null,
  evaluationReportOptions = null,
  anamneseSections = [],
}: BuildPatientReportPayloadInput): PatientReportPayload {
  const resolved = resolveReportProfessional(
    authorProfessional,
    professional,
  );
  const signature = formatProfessionalSignature(resolved);

  let roteiroPayload = null;
  if (mode === "roteiro" && roteiro) {
    const currentRoteiro = roteiroById(roteiro.roteiroId);
    const currentCategory = roteiroCategoryByTick(
      currentRoteiro,
      roteiro.categoryTick,
    );
    const note = detail.roteiroNotes.find(
      (n) =>
        n.roteiroId === roteiro.roteiroId &&
        n.categoryTick === roteiro.categoryTick,
    );
    roteiroPayload = {
      label: currentRoteiro.label,
      category: currentCategory,
      notes: note?.notes ?? "",
    };
  }

  const selectedEvaluation =
    mode === "evaluation"
      ? (evaluation ?? detail.clinicalEvaluations[0] ?? null)
      : null;

  return {
    mode,
    patientName: detail.patient.name,
    signature,
    branding,
    clinicalEvaluations: detail.clinicalEvaluations,
    selectedEvaluation,
    anamneseSections: mode === "full" ? anamneseSections : [],
    sessionNotes: detail.sessionNotes.map((s) => ({
      date: s.date,
      time: s.time,
      status: s.status,
      activities: s.activities,
      observations: s.observations,
    })),
    roteiro: roteiroPayload,
    evaluationReportOptions:
      mode === "evaluation" ? evaluationReportOptions : null,
  };
}
