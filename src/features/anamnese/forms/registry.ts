import type { HealthProfessionId } from "@/shared/constants/professions";
import { HEALTH_PROFESSIONS } from "@/shared/constants/professions";
import { paths } from "@/shared/constants/paths";
import { terapiaOcupacionalForms } from "./terapia-ocupacional";
import type {
  AnamneseFormModule,
  CatalogAnamnese,
  ProfessionAnamneseCatalogItem,
} from "./types";

/**
 * Registo único de formulários.
 * Para adicionar: criar `forms/<profissão>/<id>/module.tsx` e incluir na lista da profissão.
 */
const ANAMNESE_FORM_MODULES: AnamneseFormModule[] = [
  ...terapiaOcupacionalForms,
];

export const ANAMNESE_FORM_REGISTRY: ReadonlyMap<string, AnamneseFormModule> =
  new Map(ANAMNESE_FORM_MODULES.map((mod) => [mod.id, mod]));

export function getAnamneseForm(
  formId: string,
): AnamneseFormModule | undefined {
  return ANAMNESE_FORM_REGISTRY.get(formId);
}

function formsByProfession(
  professionId: HealthProfessionId,
): AnamneseFormModule[] {
  return ANAMNESE_FORM_MODULES.filter((m) => m.professionId === professionId);
}

function toCatalogItem(mod: AnamneseFormModule): CatalogAnamnese {
  return {
    id: mod.id,
    name: mod.name,
    description: mod.description,
    href: paths.anamnese.byId(mod.id),
  };
}

export const PROFESSION_ANAMNESE_CATALOG: ProfessionAnamneseCatalogItem[] =
  HEALTH_PROFESSIONS.map((profession) => ({
    professionId: profession.id,
    label: profession.label,
    council: profession.council,
    forms: formsByProfession(profession.id).map(toCatalogItem),
  })).sort((a, b) => {
    if (a.forms.length === b.forms.length) {
      return a.label.localeCompare(b.label, "pt-BR");
    }
    return b.forms.length - a.forms.length;
  });

export function filterAnamneseCatalogByProfessions(
  professionIds: Iterable<string>,
): ProfessionAnamneseCatalogItem[] {
  const allowed = new Set(professionIds);
  return PROFESSION_ANAMNESE_CATALOG.filter((item) =>
    allowed.has(item.professionId),
  );
}

export function getCatalogAnamnese(
  formId: string,
): CatalogAnamnese | undefined {
  const mod = getAnamneseForm(formId);
  return mod ? toCatalogItem(mod) : undefined;
}
