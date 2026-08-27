import type { HealthProfessionId } from "@/shared/constants/professions";
import type { EvaluationModule } from "@/domains/protocol/evaluation-modules/types";
import { listProtocolInstruments } from "@/domains/protocol/evaluation-modules/instruments";
import {
  createItemEvaluationModule,
  type ItemProtocolInstrument,
} from "../_shared/create-item-module";

export const TERAPIA_OCUPACIONAL_PROFESSION_ID =
  "terapeuta_ocupacional" satisfies HealthProfessionId;

/** UI dos instrumentos TO — metadados/templates vêm de `instruments.ts`. */
export const terapiaOcupacionalEvaluationModules: EvaluationModule[] =
  listProtocolInstruments()
    .filter(
      (instrument): instrument is ItemProtocolInstrument =>
        instrument.professionId === TERAPIA_OCUPACIONAL_PROFESSION_ID &&
        instrument.template != null,
    )
    .map(createItemEvaluationModule);
