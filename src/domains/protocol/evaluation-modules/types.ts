import type { HealthProfessionId } from "@/shared/constants/professions";
import type { EvaluationModuleUI } from "@/shared/types/evaluation-module-ui";
import type { ItemProtocolTemplate } from "./_shared/item-protocol-template";

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
export type EvaluationModule = EvaluationModuleUI &
  CatalogEvaluationDef & {
    /** Elegível para convite público `/r/{token}`. */
    supportsPublicInvite?: boolean;
    /** Template de itens/escalas (PEDI, SPM, …). */
    template?: ItemProtocolTemplate;
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
