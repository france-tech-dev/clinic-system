import { paths } from "@/shared/constants/paths";
import type { HealthProfessionId } from "@/shared/constants/professions";
import { HEALTH_PROFESSIONS } from "@/shared/constants/professions";
import { listProtocolInstruments } from "./instruments";
import type {
  CatalogInstrument,
  CatalogInstrumentDef,
  ProfessionInstrumentCatalogItem,
} from "./types";

/**
 * Catálogo do hub `/avaliacoes`.
 * Instrumentos nativos: derivados das listas por especialidade (agregadas em `instruments.ts`).
 */
function catalogDefsByProfession(
  professionId: HealthProfessionId,
): CatalogInstrumentDef[] {
  return listProtocolInstruments()
    .filter((mod) => mod.professionId === professionId)
    .map(({ id, name, description }) => ({ id, name, description }));
}

function withHref(assessment: CatalogInstrumentDef): CatalogInstrument {
  return {
    ...assessment,
    href: paths.avaliacoes.byId(assessment.id),
  };
}

export const PROFESSION_INSTRUMENT_CATALOG: ProfessionInstrumentCatalogItem[] =
  HEALTH_PROFESSIONS.map((profession) => ({
    professionId: profession.id,
    label: profession.label,
    council: profession.council,
    assessments: catalogDefsByProfession(profession.id).map(withHref),
  })).sort((a, b) => {
    if (a.assessments.length === b.assessments.length) {
      return a.label.localeCompare(b.label, "pt-BR");
    }
    return b.assessments.length - a.assessments.length;
  });

/** Filtra o catálogo às profissões presentes na clínica (ex.: membros ativos). */
export function filterInstrumentCatalogByProfessions(
  professionIds: Iterable<string>,
): ProfessionInstrumentCatalogItem[] {
  const allowed = new Set(professionIds);
  return PROFESSION_INSTRUMENT_CATALOG.filter((item) =>
    allowed.has(item.professionId),
  );
}

/** Resolve uma avaliação pelo id da URL (`/avaliacoes/[avaliacao]`). */
export function getCatalogInstrument(
  avaliacaoId: string,
): CatalogInstrument | undefined {
  for (const item of PROFESSION_INSTRUMENT_CATALOG) {
    const assessment = item.assessments.find((a) => a.id === avaliacaoId);
    if (assessment) return assessment;
  }
  return undefined;
}
