import type { HealthProfessionId } from "@/shared/constants/professions";
import type { EvaluationModuleUI } from "@/shared/types/evaluation-module-ui";

export type {
  EvaluationModuleRenderContext,
  EvaluationModuleUI,
} from "@/shared/types/evaluation-module-ui";

export type CatalogEvaluationDef = {
  id: string;
  name: string;
  description: string;
};

/** Instrumento nativo de `protocol`: metadados de hub + render (como anamnese). */
export type EvaluationModule = EvaluationModuleUI & CatalogEvaluationDef;

export type CatalogEvaluation = CatalogEvaluationDef & {
  href: string;
};

export type ProfessionEvaluationCatalogItem = {
  professionId: HealthProfessionId;
  label: string;
  council: string;
  assessments: CatalogEvaluation[];
};
