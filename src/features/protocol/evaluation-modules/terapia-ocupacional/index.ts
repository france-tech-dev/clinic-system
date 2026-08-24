import type { HealthProfessionId } from "@/shared/constants/professions";
import type { EvaluationModule } from "../types";
import { pediAutocuidadoModule } from "./pedi-autocuidado";
import { pediFuncaoSocialModule } from "./pedi-funcao-social";
import { pediMobilidadeModule } from "./pedi-mobilidade";
import { perfilSensorialCriancaPequenaModule } from "./perfil-sensorial-crianca-pequena";
import { spmCasa5anosModule } from "./spm-casa-5anos";
import { spmCasa3anosModule } from "./spm-casa-3anos";
import { spmCasa2anosModule } from "./spm-casa-2anos";
import { spmEscola5anosModule } from "./spm-escola-5anos";
import { spmEscola3anosModule } from "./spm-escola-3anos";
import { spmEscola2anosModule } from "./spm-escola-2anos";

export const TERAPIA_OCUPACIONAL_PROFESSION_ID =
  "terapeuta_ocupacional" satisfies HealthProfessionId;

export const terapiaOcupacionalEvaluationModules: EvaluationModule[] = [
  pediAutocuidadoModule,
  pediFuncaoSocialModule,
  pediMobilidadeModule,
  perfilSensorialCriancaPequenaModule,
  spmCasa5anosModule,
  spmCasa3anosModule,
  spmCasa2anosModule,
  spmEscola5anosModule,
  spmEscola3anosModule,
  spmEscola2anosModule,
];
