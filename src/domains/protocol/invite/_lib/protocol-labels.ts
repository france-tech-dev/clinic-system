import { getProtocolInstrument } from "@/domains/protocol/instruments/instruments";

/** Abreviatura curta para chips / listas de convite. */
export function protocolAbbrev(protocolId: string): string {
  const instrument = getProtocolInstrument(protocolId);
  if (instrument?.abbrev) return instrument.abbrev;
  return protocolId.slice(0, 2).toUpperCase();
}

export function protocolSubtitle(protocolId: string): string | null {
  return getProtocolInstrument(protocolId)?.subtitle ?? null;
}
