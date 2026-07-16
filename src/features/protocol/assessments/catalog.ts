import type { HealthProfessionId } from "@/shared/constants/professions";
import { HEALTH_PROFESSIONS } from "@/shared/constants/professions";
import { paths } from "@/shared/constants/paths";
import {
  FISIOTERAPIA_PROFESSION_ID,
  fisioterapiaCatalogAssessments,
} from "./fisioterapia";
import {
  TERAPIA_OCUPACIONAL_PROFESSION_ID,
  terapiaOcupacionalCatalogAssessments,
} from "./terapia-ocupacional";
import type {
  CatalogAssessment,
  CatalogAssessmentDef,
  ProfessionAssessmentCatalogItem,
} from "./types";

/**
 * Catálogo por profissão — cada pasta em `assessments/<profissão>/`
 * exporta a sua lista.
 */
const ASSESSMENTS_BY_PROFESSION: Partial<
  Record<HealthProfessionId, CatalogAssessmentDef[]>
> = {
  [FISIOTERAPIA_PROFESSION_ID]: fisioterapiaCatalogAssessments,
  [TERAPIA_OCUPACIONAL_PROFESSION_ID]: terapiaOcupacionalCatalogAssessments,
};

function withHref(assessment: CatalogAssessmentDef): CatalogAssessment {
  return {
    ...assessment,
    href: paths.avaliacoes.byId(assessment.id),
  };
}

/**
 * Catálogo de avaliações no hub (`/avaliacoes`).
 * O `id` deve coincidir com o registry de UI (`./registry.ts`).
 */
export const PROFESSION_ASSESSMENT_CATALOG: ProfessionAssessmentCatalogItem[] =
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
export function filterAssessmentCatalogByProfessions(
  professionIds: Iterable<string>,
): ProfessionAssessmentCatalogItem[] {
  const allowed = new Set(professionIds);
  return PROFESSION_ASSESSMENT_CATALOG.filter((item) =>
    allowed.has(item.professionId),
  );
}

/** Resolve uma avaliação pelo id da URL (`/avaliacoes/[avaliacao]`). */
export function getCatalogAssessment(
  avaliacaoId: string,
): CatalogAssessment | undefined {
  for (const item of PROFESSION_ASSESSMENT_CATALOG) {
    const assessment = item.assessments.find((a) => a.id === avaliacaoId);
    if (assessment) return assessment;
  }
  return undefined;
}
