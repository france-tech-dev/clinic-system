import type { HealthProfessionId } from "@/shared/constants/professions";
import { fisioterapiaCatalogEvaluations } from "./catalog";
import { gmfm88EvaluationModuleUI } from "./gmfm-88";
import type { EvaluationModuleUI } from "../types";

export const FISIOTERAPIA_PROFESSION_ID =
  "fisioterapeuta" satisfies HealthProfessionId;

export const fisioterapiaEvaluationModuleUIs: EvaluationModuleUI[] = [gmfm88EvaluationModuleUI];

export { fisioterapiaCatalogEvaluations };
