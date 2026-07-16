import { fisioterapiaUiModules } from "./fisioterapia";
import { terapiaOcupacionalUiModules } from "./terapia-ocupacional";
import type { AssessmentUiModule } from "./types";

/**
 * Registry de UIs de avaliação, agrupado por pasta de profissão e avaliação.
 *
 * Para adicionar uma avaliação:
 * 1. `assessments/<profissão>/<id>/` — catalog, ui, template, scoring, components
 * 2. Incluir no `catalog.ts` e `index.ts` da profissão
 */
const ASSESSMENT_UI_MODULES: AssessmentUiModule[] = [
  ...fisioterapiaUiModules,
  ...terapiaOcupacionalUiModules,
];

export const ASSESSMENT_UI_REGISTRY: ReadonlyMap<string, AssessmentUiModule> =
  new Map(ASSESSMENT_UI_MODULES.map((mod) => [mod.id, mod]));

export function getAssessmentUi(
  avaliacaoId: string,
): AssessmentUiModule | undefined {
  return ASSESSMENT_UI_REGISTRY.get(avaliacaoId);
}

export function isAssessmentUiRegistered(avaliacaoId: string): boolean {
  return ASSESSMENT_UI_REGISTRY.has(avaliacaoId);
}
