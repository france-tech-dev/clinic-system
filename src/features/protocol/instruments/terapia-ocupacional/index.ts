import { TERAPIA_OCUPACIONAL_INSTRUMENTS } from "@/domains/protocol/instruments/terapia-ocupacional/instruments";
import { createItemInstrumentModule } from "../_shared/create-item-module";
import type { ProtocolInstrumentModule } from "../types";

/** UI TO — metadados/templates em `domains/.../terapia-ocupacional/instruments.ts`. */
export const terapiaOcupacionalInstrumentModules: ProtocolInstrumentModule[] =
  TERAPIA_OCUPACIONAL_INSTRUMENTS.map(createItemInstrumentModule);
