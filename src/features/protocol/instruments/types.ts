import type { ItemProtocolTemplate } from "@/domains/protocol/instruments/_shared/item-protocol-template";
import type { CatalogInstrumentDef } from "@/domains/protocol/instruments/types";
import type { ProtocolInstrumentUI } from "@/shared/types/protocol-instrument-ui";

export type {
  ProtocolInstrumentRenderContext,
  ProtocolInstrumentUI,
} from "@/shared/types/protocol-instrument-ui";

/** Módulo UI de instrumento: metadados de catálogo + render do workspace. */
export type ProtocolInstrumentModule = ProtocolInstrumentUI &
  CatalogInstrumentDef & {
    supportsPublicInvite?: boolean;
    template?: ItemProtocolTemplate;
  };
