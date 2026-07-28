import { getEvaluationModuleUI } from "@/features/protocol/evaluation-modules";
import { getRoteiroEvaluationModuleUI } from "@/features/patient/roteiro-evaluation-module-ui";
import type { EvaluationModuleUI } from "@/shared/types/evaluation-module-ui";

/**
 * Resolve o módulo de UI de uma avaliação.
 * Une o registry de `protocol` com instrumentos cujo render vive em `patient`
 * (roteiros) — features não se importam; a composição fica em `app/`.
 */
export function resolveEvaluationModuleUI(
  avaliacaoId: string,
): EvaluationModuleUI | undefined {
  return getEvaluationModuleUI(avaliacaoId) ?? getRoteiroEvaluationModuleUI(avaliacaoId);
}
