import { describe, expect, it } from "vitest";
import type { ItemProtocolTemplate } from "@/domains/protocol/evaluation-modules/_shared/item-protocol-template";
import { summarizeItemProtocol } from "@/domains/protocol/evaluation-modules/_shared/item-protocol-scoring";

describe("summarizeItemProtocol", () => {
  it("calcula % PEDI (0/1) por secção e overall", () => {
    const template: ItemProtocolTemplate = {
      scale: "pedi",
      sections: [
        {
          id: "a",
          title: "A",
          items: [
            { id: "a1", label: "1" },
            { id: "a2", label: "2" },
          ],
        },
        {
          id: "b",
          title: "B",
          items: [{ id: "b1", label: "1" }],
        },
      ],
    };

    const summary = summarizeItemProtocol(template, {
      a1: 1,
      a2: 0,
      b1: 1,
    });

    expect(summary.domains[0]).toMatchObject({
      totalScore: 1,
      maxScore: 2,
      percent: 50,
    });
    expect(summary.domains[1]).toMatchObject({
      totalScore: 1,
      maxScore: 1,
      percent: 100,
    });
    expect(summary.totalScore).toBe(2);
    expect(summary.maxScore).toBe(3);
    expect(summary.percent).toBeCloseTo((2 / 3) * 100);
  });

  it("SPM usa N=1…S=4 e máximo 4 por item", () => {
    const template: ItemProtocolTemplate = {
      scale: "spm",
      sections: [
        {
          id: "visao",
          title: "Visão",
          items: [
            { id: "v1", label: "1" },
            { id: "v2", label: "2" },
          ],
        },
      ],
    };

    const summary = summarizeItemProtocol(template, {
      v1: "S",
      v2: "N",
    });

    expect(summary.totalScore).toBe(4 + 1);
    expect(summary.maxScore).toBe(8);
    expect(summary.percent).toBeCloseTo((5 / 8) * 100);
  });

  it("Perfil Sensorial exclui N/A (0) do máximo", () => {
    const template: ItemProtocolTemplate = {
      scale: "perfil-sensorial",
      sections: [
        {
          id: "s1",
          title: "Secção",
          items: [
            { id: "i1", label: "A" },
            { id: "i2", label: "B" },
          ],
        },
      ],
    };

    const summary = summarizeItemProtocol(template, {
      i1: 5,
      i2: 0,
    });

    expect(summary.totalScore).toBe(5);
    expect(summary.maxScore).toBe(5);
    expect(summary.percent).toBe(100);
  });
});
