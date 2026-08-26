import { terapiaOcupacionalForms } from "./terapia-ocupacional";
import type { AnamneseFormModule } from "@/domains/anamnese/forms/types";

/**
 * Registo único de formulários (UI).
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

export function listAnamneseForms(): AnamneseFormModule[] {
  return ANAMNESE_FORM_MODULES;
}
