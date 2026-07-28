import type { HealthProfessionId } from "@/shared/constants/professions";

export type {
  EvaluationModuleRenderContext,
  EvaluationModuleUI,
} from "@/shared/types/evaluation-module-ui";

export type CatalogEvaluationDef = {
  id: string;
  name: string;
  description: string;
};

export type CatalogEvaluation = CatalogEvaluationDef & {
  href: string;
};

export type ProfessionEvaluationCatalogItem = {
  professionId: HealthProfessionId;
  label: string;
  council: string;
  assessments: CatalogEvaluation[];
};
