import type { HealthProfessionId } from "@/shared/constants/professions";
import type { EvaluationModule } from "../types";
import { pediAutocuidadoModule } from "./pedi-autocuidado";
import { pediFuncaoSocialModule } from "./pedi-funcao-social";
import { pediMobilidadeModule } from "./pedi-mobilidade";
import { spmCasa5anosModule } from "./spm-casa-5anos";
import { spmCasa3anosModule } from "./spm-casa-3anos";
import { spmCasa2anosModule } from "./spm-casa-2anos";

export const TERAPIA_OCUPACIONAL_PROFESSION_ID =
  "terapeuta_ocupacional" satisfies HealthProfessionId;

export const terapiaOcupacionalEvaluationModules: EvaluationModule[] = [
  pediAutocuidadoModule,
  pediFuncaoSocialModule,
  pediMobilidadeModule,
  spmCasa5anosModule,
  spmCasa3anosModule,
  spmCasa2anosModule,
];
