import { ROTEIROS, type RoteiroId } from "@/shared/constants/roteiros";
import type { CatalogEvaluationDef } from "../types";

const ROTEIRO_DESCRIPTIONS: Record<RoteiroId, string> = {
  "sensory-integration":
    "Roteiro de observação dos sistemas sensoriais (vestibular, proprioceptivo, tátil e demais).",
  "fine-motor":
    "Roteiro de observação de motricidade fina, preensão e habilidades de escrita.",
  "feeding-selectivity":
    "Roteiro de observação de alimentação, seletividade e aspectos oromotores.",
};

/** Metadados das avaliações de terapia ocupacional (hub). */
export const terapiaOcupacionalCatalogEvaluations: CatalogEvaluationDef[] =
  ROTEIROS.map((roteiro) => ({
    id: roteiro.id,
    name: roteiro.label,
    description: ROTEIRO_DESCRIPTIONS[roteiro.id],
  }));
