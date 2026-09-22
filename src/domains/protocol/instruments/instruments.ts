import type { ProtocolInstrument } from "./_shared/define-instrument";
import { FISIOTERAPIA_INSTRUMENTS } from "./fisioterapia/instruments";
import { TERAPIA_OCUPACIONAL_INSTRUMENTS } from "./terapia-ocupacional/instruments";

export type { ProtocolInstrument } from "./_shared/define-instrument";

/**
 * Registry global — agrega listas por especialidade.
 *
 * Nova especialidade (psicologia, fono, …):
 * 1. `domains/protocol/instruments/<profissão>/instruments.ts` + templates
 * 2. incluir abaixo
 * 3. `features/protocol/instruments/<profissão>/` (UI registry)
 */
const PROTOCOL_INSTRUMENTS: ProtocolInstrument[] = [
  ...FISIOTERAPIA_INSTRUMENTS,
  ...TERAPIA_OCUPACIONAL_INSTRUMENTS,
];

export function listProtocolInstruments(): ProtocolInstrument[] {
  return PROTOCOL_INSTRUMENTS;
}

export function getProtocolInstrument(
  id: string,
): ProtocolInstrument | undefined {
  return PROTOCOL_INSTRUMENTS.find((instrument) => instrument.id === id);
}
