import { fisioterapiaInstrumentModules } from "./fisioterapia";
import { terapiaOcupacionalInstrumentModules } from "./terapia-ocupacional";
import type { ProtocolInstrumentModule } from "./types";

const PROTOCOL_INSTRUMENT_MODULES: ProtocolInstrumentModule[] = [
  ...fisioterapiaInstrumentModules,
  ...terapiaOcupacionalInstrumentModules,
];

export const PROTOCOL_INSTRUMENT_MODULE_REGISTRY: ReadonlyMap<
  string,
  ProtocolInstrumentModule
> = new Map(PROTOCOL_INSTRUMENT_MODULES.map((mod) => [mod.id, mod]));

export function getProtocolInstrumentModule(
  avaliacaoId: string,
): ProtocolInstrumentModule | undefined {
  return PROTOCOL_INSTRUMENT_MODULE_REGISTRY.get(avaliacaoId);
}

export function listProtocolInstrumentModules(): ProtocolInstrumentModule[] {
  return PROTOCOL_INSTRUMENT_MODULES;
}
