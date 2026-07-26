import { getAssessmentUi } from "@/features/protocol/assessments";
import { getRoteiroAssessmentUi } from "@/features/patient/roteiro-assessment-ui";
import type { AssessmentUiModule } from "@/shared/types/assessment-ui";

/**
 * Resolve o módulo de UI de uma avaliação.
 * Une o registry de `protocol` com instrumentos cujo render vive em `patient`
 * (roteiros) — features não se importam; a composição fica em `app/`.
 */
export function resolveAssessmentUi(
  avaliacaoId: string,
): AssessmentUiModule | undefined {
  return getAssessmentUi(avaliacaoId) ?? getRoteiroAssessmentUi(avaliacaoId);
}
