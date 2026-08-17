import { getEvaluationModuleUI } from "@/features/protocol/evaluation-modules";
import { getRoteiroEvaluationModuleUI } from "@/features/patient/roteiro-evaluation-module-ui";
import type { EvaluationModuleUI } from "@/shared/types/evaluation-module-ui";

export function resolveEvaluationModuleUI(
  avaliacaoId: string,
): EvaluationModuleUI | undefined {
  return (
    getEvaluationModuleUI(avaliacaoId) ??
    getRoteiroEvaluationModuleUI(avaliacaoId)
  );
}
