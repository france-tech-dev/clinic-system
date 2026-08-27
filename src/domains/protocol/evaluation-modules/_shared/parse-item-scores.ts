import type { ItemProtocolTemplate } from "./item-protocol-template";
import {
  isValidItemResponse,
  type ItemResponseValue,
} from "./item-scale";
import { listItemProtocolItemIds } from "./item-protocol-template";

/** Normaliza scores persistidos (JSON) para o formulário de item-protocol. */
export function scoresToItemResponses(
  template: ItemProtocolTemplate,
  scores: Record<string, number | string | null>,
): Record<string, ItemResponseValue | null> {
  const out: Record<string, ItemResponseValue | null> = {};
  for (const id of listItemProtocolItemIds(template)) {
    const value = scores[id];
    out[id] = isValidItemResponse(template.scale, value) ? value : null;
  }
  return out;
}
