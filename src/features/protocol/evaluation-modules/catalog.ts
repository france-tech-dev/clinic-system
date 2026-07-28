import type { HealthProfessionId } from "@/shared/constants/professions";
import { HEALTH_PROFESSIONS } from "@/shared/constants/professions";
import { paths } from "@/shared/constants/paths";
import {
  FISIOTERAPIA_PROFESSION_ID,
  fisioterapiaCatalogEvaluations,
} from "./fisioterapia";
import {
  TERAPIA_OCUPACIONAL_PROFESSION_ID,
  terapiaOcupacionalCatalogEvaluations,
} from "./terapia-ocupacional";
import type {
  CatalogEvaluation,
  CatalogEvaluationDef,
  ProfessionEvaluationCatalogItem,
} from "./types";

/**
 * Catálogo por profissão — cada pasta em `assessments/<profissão>/`
 * exporta a sua lista.
 */
const ASSESSMENTS_BY_PROFESSION: Partial<
  Record<HealthProfessionId, CatalogEvaluationDef[]>
> = {
  [FISIOTERAPIA_PROFESSION_ID]: fisioterapiaCatalogEvaluations,
  [TERAPIA_OCUPACIONAL_PROFESSION_ID]: terapiaOcupacionalCatalogEvaluations,
};

function withHref(assessment: CatalogEvaluationDef): CatalogEvaluation {
  return {
    ...assessment,
    href: paths.avaliacoes.byId(assessment.id),
  };
}

/**
 * Catálogo de avaliações no hub (`/avaliacoes`).
 * O `id` deve coincidir com o registry de UI (`./registry.ts`).
 */
export const PROFESSION_EVALUATION_CATALOG: ProfessionEvaluationCatalogItem[] =
  HEALTH_PROFESSIONS.map((profession) => ({
    professionId: profession.id,
    label: profession.label,
    council: profession.council,
    assessments: (ASSESSMENTS_BY_PROFESSION[profession.id] ?? []).map(withHref),
  })).sort((a, b) => {
    if (a.assessments.length === b.assessments.length) {
      return a.label.localeCompare(b.label, "pt-BR");
    }
    return b.assessments.length - a.assessments.length;
  });

/** Filtra o catálogo às profissões presentes na clínica (ex.: membros ativos). */
export function filterEvaluationCatalogByProfessions(
  professionIds: Iterable<string>,
): ProfessionEvaluationCatalogItem[] {
  const allowed = new Set(professionIds);
  return PROFESSION_EVALUATION_CATALOG.filter((item) =>
    allowed.has(item.professionId),
  );
}

/** Resolve uma avaliação pelo id da URL (`/avaliacoes/[avaliacao]`). */
export function getCatalogEvaluation(
  avaliacaoId: string,
): CatalogEvaluation | undefined {
  for (const item of PROFESSION_EVALUATION_CATALOG) {
    const assessment = item.assessments.find((a) => a.id === avaliacaoId);
    if (assessment) return assessment;
  }
  return undefined;
}
