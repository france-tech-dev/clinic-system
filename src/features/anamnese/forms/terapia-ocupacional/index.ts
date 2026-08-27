import type { HealthProfessionId } from "@/shared/constants/professions";
import type { AnamneseFormModule } from "@/domains/anamnese/forms/types";
import { anamneseToForm } from "./anamnese-to/module";

export const TERAPIA_OCUPACIONAL_PROFESSION_ID =
  "terapeuta_ocupacional" satisfies HealthProfessionId;

export const terapiaOcupacionalForms: AnamneseFormModule[] = [anamneseToForm];
