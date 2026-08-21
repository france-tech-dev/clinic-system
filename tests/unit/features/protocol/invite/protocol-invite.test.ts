import { describe, expect, it } from "vitest";
import { createProtocolInviteToken } from "@/features/protocol/invite/_lib/token";
import { computeInviteFlags } from "@/features/protocol/invite/_lib/invite-status";
import {
  countAnsweredResponses,
  createItemResponseSchema,
  emptyItemProtocolResponses,
  parseItemProtocolResponses,
  type ItemProtocolTemplate,
} from "@/features/protocol/evaluation-modules/_shared/item-protocol-template";
import { isValidItemResponse } from "@/features/protocol/evaluation-modules/_shared/item-scale";

const sampleTemplate: ItemProtocolTemplate = {
  scale: "pedi",
  sections: [
    {
      id: "a",
      title: "Secção A",
      items: [
        { id: "a-01", label: "Item 1" },
        { id: "a-02", label: "Item 2" },
      ],
    },
  ],
};

describe("createProtocolInviteToken", () => {
  it("gera tokens URL-safe distintos", () => {
    const a = createProtocolInviteToken();
    const b = createProtocolInviteToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a.length).toBeGreaterThanOrEqual(40);
    expect(a).not.toBe(b);
  });
});

describe("item protocol responses", () => {
  it("valida escala PEDI", () => {
    expect(isValidItemResponse("pedi", 0)).toBe(true);
    expect(isValidItemResponse("pedi", 1)).toBe(true);
    expect(isValidItemResponse("pedi", 2)).toBe(false);
    expect(isValidItemResponse("spm", "N")).toBe(true);
    expect(isValidItemResponse("spm", "X")).toBe(false);
  });

  it("conta respostas válidas", () => {
    const responses = emptyItemProtocolResponses(sampleTemplate);
    responses["a-01"] = 1;
    const counts = countAnsweredResponses(sampleTemplate, responses);
    expect(counts).toEqual({ answered: 1, total: 2 });
  });

  it("exige todos os itens no schema de submit", () => {
    const schema = createItemResponseSchema(sampleTemplate);
    expect(schema.safeParse({ "a-01": 1 }).success).toBe(false);
    expect(schema.safeParse({ "a-01": 1, "a-02": 0 }).success).toBe(true);
  });

  it("ignora valores inválidos ao parsear respostas", () => {
    const parsed = parseItemProtocolResponses(sampleTemplate, {
      "a-01": 1,
      "a-02": 9,
    });
    expect(parsed["a-01"]).toBe(1);
    expect(parsed["a-02"]).toBeNull();
  });
});

describe("computeInviteFlags", () => {
  const now = new Date("2026-08-21T12:00:00.000Z");

  it("activo quando não revogado nem expirado", () => {
    expect(
      computeInviteFlags(
        {
          revokedAt: null,
          expiresAt: new Date("2026-09-21T12:00:00.000Z"),
          itemStatuses: ["pending", "pending"],
        },
        now,
      ),
    ).toMatchObject({ isActive: true, allSubmitted: false });
  });

  it("expirado e inactivo", () => {
    expect(
      computeInviteFlags(
        {
          revokedAt: null,
          expiresAt: new Date("2026-08-01T12:00:00.000Z"),
          itemStatuses: ["pending"],
        },
        now,
      ),
    ).toMatchObject({ isExpired: true, isActive: false });
  });

  it("revogado e inactivo", () => {
    expect(
      computeInviteFlags(
        {
          revokedAt: new Date("2026-08-20T12:00:00.000Z"),
          expiresAt: new Date("2026-09-21T12:00:00.000Z"),
          itemStatuses: ["submitted"],
        },
        now,
      ),
    ).toMatchObject({ isRevoked: true, isActive: false, allSubmitted: true });
  });
});
