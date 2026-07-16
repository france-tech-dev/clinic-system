import type { HealthProfessionId } from "@/shared/constants/professions";
import { terapiaOcupacionalCatalogAssessments } from "./catalog";
import type { AssessmentUiModule, CatalogAssessmentDef } from "../types";

export const TERAPIA_OCUPACIONAL_PROFESSION_ID =
  "terapeuta_ocupacional" satisfies HealthProfessionId;

/** UIs registadas desta profissão — adicionar módulos aqui. */
export const terapiaOcupacionalUiModules: AssessmentUiModule[] = [];

export {
  terapiaOcupacionalCatalogAssessments,
  type CatalogAssessmentDef,
};
