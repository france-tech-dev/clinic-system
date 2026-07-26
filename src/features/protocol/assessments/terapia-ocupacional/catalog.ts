import { ROTEIROS, type RoteiroId } from "@/shared/constants/roteiros";
import type { CatalogAssessmentDef } from "../types";

const ROTEIRO_DESCRIPTIONS: Record<RoteiroId, string> = {
  "integracao-sensorial":
    "Roteiro de observação dos sistemas sensoriais (vestibular, proprioceptivo, tátil e demais).",
  grafomotor:
    "Roteiro de observação de motricidade fina, preensão e habilidades de escrita.",
  alimentacao:
    "Roteiro de observação de alimentação, seletividade e aspectos oromotores.",
};

/** Metadados das avaliações de terapia ocupacional (hub). */
export const terapiaOcupacionalCatalogAssessments: CatalogAssessmentDef[] =
  ROTEIROS.map((roteiro) => ({
    id: roteiro.id,
    name: roteiro.label,
    description: ROTEIRO_DESCRIPTIONS[roteiro.id],
  }));
