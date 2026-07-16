import type { ReactNode } from "react";
import type { HealthProfessionId } from "@/shared/constants/professions";
import type { AssessmentPatientOption } from "@/shared/types/assessment-patient";

/** Contexto comum passado pela rota `/avaliacoes/[avaliacao]`. */
export type AssessmentRenderContext = {
  organizationId: string;
  patients: AssessmentPatientOption[];
  initialPatientId: string | null;
};

export type AssessmentUiModule = {
  id: string;
  professionId: HealthProfessionId;
  /** Carrega dados específicos e devolve o client da avaliação. */
  render: (ctx: AssessmentRenderContext) => Promise<ReactNode>;
};

export type CatalogAssessmentDef = {
  id: string;
  name: string;
  description: string;
};

export type CatalogAssessment = CatalogAssessmentDef & {
  href: string;
};

export type ProfessionAssessmentCatalogItem = {
  professionId: HealthProfessionId;
  label: string;
  council: string;
  assessments: CatalogAssessment[];
};
