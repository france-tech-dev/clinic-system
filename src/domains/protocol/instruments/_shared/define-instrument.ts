import type { HealthProfessionId } from "@/shared/constants/professions";
import type { ProtocolScoreValue } from "../../protocol.types";
import type { CatalogInstrumentDef } from "../types";
import { summarizeItemProtocol } from "./item-protocol-scoring";
import type { ItemProtocolTemplate } from "./item-protocol-template";
import type { ProtocolOverallSummary } from "./protocol-score-summary";

export type ProtocolInstrumentFamily = "gmfm" | "item-protocol";

export type ProtocolInstrument = CatalogInstrumentDef & {
  professionId: HealthProfessionId;
  family: ProtocolInstrumentFamily;
  summarize: (
    scores: Record<string, ProtocolScoreValue>,
  ) => ProtocolOverallSummary | null;
  /** Abreviatura curta para chips / listas de convite. */
  abbrev: string;
  /** Subtítulo opcional (contexto casa/escola/idade). */
  subtitle?: string;
  supportsPublicInvite?: boolean;
  template?: ItemProtocolTemplate;
};

/** Instrumento item-protocol com template obrigatório. */
export type ItemProtocolInstrument = ProtocolInstrument & {
  template: ItemProtocolTemplate;
};

/** Factory para instrumentos PEDI / SPM / Perfil (e futuros item-protocol). */
export function defineItemProtocolInstrument(
  def: CatalogInstrumentDef & {
    professionId: HealthProfessionId;
    template: ItemProtocolTemplate;
    abbrev: string;
    subtitle?: string;
    supportsPublicInvite?: boolean;
    /** Override (ex. SPM com normas). */
    summarize?: (
      scores: Record<string, ProtocolScoreValue>,
    ) => ProtocolOverallSummary | null;
  },
): ItemProtocolInstrument {
  const { template, summarize, ...rest } = def;
  return {
    ...rest,
    template,
    family: "item-protocol",
    summarize:
      summarize ?? ((scores) => summarizeItemProtocol(template, scores)),
  };
}
