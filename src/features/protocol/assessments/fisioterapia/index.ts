import type { HealthProfessionId } from "@/shared/constants/professions";
import { fisioterapiaCatalogAssessments } from "./catalog";
import { gmfm88AssessmentUi } from "./gmfm-88";
import type { AssessmentUiModule } from "../types";

export const FISIOTERAPIA_PROFESSION_ID =
  "fisioterapeuta" satisfies HealthProfessionId;

export const fisioterapiaUiModules: AssessmentUiModule[] = [gmfm88AssessmentUi];

export { fisioterapiaCatalogAssessments };
