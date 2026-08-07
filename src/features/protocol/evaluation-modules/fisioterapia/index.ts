import type { HealthProfessionId } from "@/shared/constants/professions";
import { gmfm88Module } from "./gmfm-88";
import type { EvaluationModule } from "../types";

export const FISIOTERAPIA_PROFESSION_ID =
  "fisioterapeuta" satisfies HealthProfessionId;

export const fisioterapiaEvaluationModules: EvaluationModule[] = [gmfm88Module];
