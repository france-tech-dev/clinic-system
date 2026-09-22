import { z } from "zod";
import {
  isValidItemResponse,
  type ItemScaleId,
  type ItemResponseValue,
} from "./item-scale";

export type ItemProtocolItem = {
  id: string;
  label: string;
};

export type ItemProtocolSection = {
  id: string;
  title: string;
  items: ItemProtocolItem[];
};

export type ItemProtocolTemplate = {
  scale: ItemScaleId;
  sections: ItemProtocolSection[];
};

export type ItemProtocolResponses = Record<string, ItemResponseValue | null>;

export function listItemProtocolItemIds(
  template: ItemProtocolTemplate,
): string[] {
  return template.sections.flatMap((section) =>
    section.items.map((item) => item.id),
  );
}

export function emptyItemProtocolResponses(
  template: ItemProtocolTemplate,
): ItemProtocolResponses {
  const out: ItemProtocolResponses = {};
  for (const id of listItemProtocolItemIds(template)) {
    out[id] = null;
  }
  return out;
}

export function countAnsweredResponses(
  template: ItemProtocolTemplate,
  responses: Record<string, unknown>,
): { answered: number; total: number } {
  const ids = listItemProtocolItemIds(template);
  let answered = 0;
  for (const id of ids) {
    if (isValidItemResponse(template.scale, responses[id])) answered += 1;
  }
  return { answered, total: ids.length };
}

export function createItemResponseSchema(template: ItemProtocolTemplate) {
  const ids = listItemProtocolItemIds(template);
  return z.record(z.string(), z.unknown()).superRefine((responses, ctx) => {
    for (const id of ids) {
      const value = responses[id];
      if (value === undefined || value === null) {
        ctx.addIssue({
          code: "custom",
          message: "Responda todos os itens antes de enviar",
          path: [id],
        });
        continue;
      }
      if (!isValidItemResponse(template.scale, value)) {
        ctx.addIssue({
          code: "custom",
          message: `Resposta inválida para ${id}`,
          path: [id],
        });
      }
    }
  });
}

export function parseItemProtocolResponses(
  template: ItemProtocolTemplate,
  raw: unknown,
): ItemProtocolResponses {
  const base = emptyItemProtocolResponses(template);
  if (!raw || typeof raw !== "object") return base;
  const source = raw as Record<string, unknown>;
  for (const id of listItemProtocolItemIds(template)) {
    const value = source[id];
    if (isValidItemResponse(template.scale, value)) {
      base[id] = value;
    }
  }
  return base;
}
