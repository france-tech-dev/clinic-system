import { fisioterapiaEvaluationModuleUIs } from "./fisioterapia";
import { terapiaOcupacionalEvaluationModuleUIs } from "./terapia-ocupacional";
import type { EvaluationModuleUI } from "./types";

/**
 * Registry de UIs de avaliação, agrupado por pasta de profissão e avaliação.
 *
 * Para adicionar uma avaliação:
 * 1. `assessments/<profissão>/<id>/` — catalog, ui, template, scoring, components
 * 2. Incluir no `catalog.ts` e `index.ts` da profissão
 */
const EVALUATION_MODULE_UI_MODULES: EvaluationModuleUI[] = [
  ...fisioterapiaEvaluationModuleUIs,
  ...terapiaOcupacionalEvaluationModuleUIs,
];

export const EVALUATION_MODULE_UI_REGISTRY: ReadonlyMap<string, EvaluationModuleUI> =
  new Map(EVALUATION_MODULE_UI_MODULES.map((mod) => [mod.id, mod]));

export function getEvaluationModuleUI(
  avaliacaoId: string,
): EvaluationModuleUI | undefined {
  return EVALUATION_MODULE_UI_REGISTRY.get(avaliacaoId);
}

export function isEvaluationModuleUIRegistered(avaliacaoId: string): boolean {
  return EVALUATION_MODULE_UI_REGISTRY.has(avaliacaoId);
}
