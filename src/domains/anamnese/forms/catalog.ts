import type { HealthProfessionId } from "@/shared/constants/professions";
import { HEALTH_PROFESSIONS } from "@/shared/constants/professions";
import { paths } from "@/shared/constants/paths";
import type {
  CatalogAnamnese,
  CatalogAnamneseDef,
  ProfessionAnamneseCatalogItem,
} from "./types";

export const ANAMNESE_TO_FORM_ID = "anamnese-to";

const ANAMNESE_FORM_DEFS: (CatalogAnamneseDef & {
  professionId: HealthProfessionId;
})[] = [
  {
    id: ANAMNESE_TO_FORM_ID,
    name: "Anamnese de Terapia Ocupacional",
    description:
      "Formulário de anamnese ocupacional (AVDs, sensorial, rotina e expectativas).",
    professionId: "terapeuta_ocupacional",
  },
];

function catalogDefsByProfession(
  professionId: HealthProfessionId,
): CatalogAnamneseDef[] {
  return ANAMNESE_FORM_DEFS.filter((def) => def.professionId === professionId).map(
    ({ id, name, description }) => ({ id, name, description }),
  );
}

function withHref(form: CatalogAnamneseDef): CatalogAnamnese {
  return {
    ...form,
    href: paths.anamnese.byId(form.id),
  };
}

export const PROFESSION_ANAMNESE_CATALOG: ProfessionAnamneseCatalogItem[] =
  HEALTH_PROFESSIONS.map((profession) => ({
    professionId: profession.id,
    label: profession.label,
    council: profession.council,
    forms: catalogDefsByProfession(profession.id).map(withHref),
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
  for (const item of PROFESSION_ANAMNESE_CATALOG) {
    const form = item.forms.find((f) => f.id === formId);
    if (form) return form;
  }
  return undefined;
}
