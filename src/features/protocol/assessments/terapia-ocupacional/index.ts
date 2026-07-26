import type { HealthProfessionId } from "@/shared/constants/professions";
import { terapiaOcupacionalCatalogAssessments } from "./catalog";
import type { AssessmentUiModule, CatalogAssessmentDef } from "../types";

export const TERAPIA_OCUPACIONAL_PROFESSION_ID =
  "terapeuta_ocupacional" satisfies HealthProfessionId;

/** UIs nativas desta profissão (ex. protocolos com scoring em `protocol`). */
export const terapiaOcupacionalUiModules: AssessmentUiModule[] = [];
// Roteiros T.O.: render em `features/patient/roteiro-assessment-ui.tsx`,
// compostos via `app/(authenticated)/avaliacoes/_lib/resolve-assessment-ui.ts`.

export {
  terapiaOcupacionalCatalogAssessments,
  type CatalogAssessmentDef,
};
