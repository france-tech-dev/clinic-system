import { fisioterapiaEvaluationModules } from "./fisioterapia";
import type { EvaluationModule, EvaluationModuleUI } from "./types";

/**
 * Instrumentos com UI em `protocol`.
 * Para adicionar: `evaluation-modules/<profissão>/<id>/module.tsx` e incluir na lista da profissão.
 *
 * Roteiros T.O. (UI em `patient`) compostam-se em
 * `app/(authenticated)/avaliacoes/_lib/resolve-evaluation-module-ui.ts`.
 */
const EVALUATION_MODULES: EvaluationModule[] = [
  ...fisioterapiaEvaluationModules,
];

export const EVALUATION_MODULE_REGISTRY: ReadonlyMap<string, EvaluationModule> =
  new Map(EVALUATION_MODULES.map((mod) => [mod.id, mod]));

export function getEvaluationModule(
  avaliacaoId: string,
): EvaluationModule | undefined {
  return EVALUATION_MODULE_REGISTRY.get(avaliacaoId);
}

/** Compatível com o contrato partilhado (`EvaluationModuleUI`). */
export function getEvaluationModuleUI(
  avaliacaoId: string,
): EvaluationModuleUI | undefined {
  return getEvaluationModule(avaliacaoId);
}

export function listEvaluationModules(): EvaluationModule[] {
  return EVALUATION_MODULES;
}
