import type { HealthProfessionId } from "@/shared/constants/professions";

export type {
  AssessmentRenderContext,
  AssessmentUiModule,
} from "@/shared/types/assessment-ui";

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
