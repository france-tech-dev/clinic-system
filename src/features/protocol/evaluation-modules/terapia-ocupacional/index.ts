import type { HealthProfessionId } from "@/shared/constants/professions";
import { terapiaOcupacionalCatalogEvaluations } from "./catalog";
import type { EvaluationModuleUI, CatalogEvaluationDef } from "../types";

export const TERAPIA_OCUPACIONAL_PROFESSION_ID =
  "terapeuta_ocupacional" satisfies HealthProfessionId;

/** UIs nativas desta profissão (ex. protocolos com scoring em `protocol`). */
export const terapiaOcupacionalEvaluationModuleUIs: EvaluationModuleUI[] = [];
// Roteiros T.O.: render em `features/patient/roteiro-evaluation-module-ui.tsx`,
// compostos via `app/(authenticated)/avaliacoes/_lib/resolve-evaluation-module-ui.ts`.

export {
  terapiaOcupacionalCatalogEvaluations,
  type CatalogEvaluationDef,
};
