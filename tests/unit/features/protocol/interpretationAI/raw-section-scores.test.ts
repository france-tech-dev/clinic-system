import { describe, expect, it } from "vitest";
import type { ItemProtocolTemplate } from "@/features/protocol/evaluation-modules/_shared/item-protocol-template";
import {
  computeItemProtocolRawScores,
  formatRawScoresForPrompt,
} from "@/features/protocol/_lib/interpretationAI/raw-section-scores";

const template: ItemProtocolTemplate = {
  scale: "spm",
  sections: [
    {
      id: "audicao",
      title: "Audição",
      items: [
        { id: "a1", label: "Item 1" },
        { id: "a2", label: "Item 2" },
        { id: "a3", label: "Item 3" },
      ],
    },
    {
      id: "tato",
      title: "Tato",
      items: [
        { id: "t1", label: "Item 1" },
        { id: "t2", label: "Item 2" },
      ],
    },
  ],
};

describe("computeItemProtocolRawScores", () => {
  it("soma SPM com N=1…S=4 e marca itens elevados F/S", () => {
    const summary = computeItemProtocolRawScores(template, {
      a1: "S",
      a2: "N",
      a3: "F",
      t1: "O",
      t2: null,
    });

    expect(summary.scale).toBe("spm");
    expect(summary.sections[0]).toMatchObject({
      title: "Audição",
      rawSum: 4 + 1 + 3,
      answeredCount: 3,
      itemCount: 3,
      elevatedItemNumbers: [1, 3],
    });
    expect(summary.sections[1]).toMatchObject({
      title: "Tato",
      rawSum: 2,
      answeredCount: 1,
      itemCount: 2,
      elevatedItemNumbers: [],
    });
  });

  it("exclui Perfil Sensorial 0 (N/A) da soma", () => {
    const perfil: ItemProtocolTemplate = {
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
    const summary = computeItemProtocolRawScores(perfil, {
      i1: 5,
      i2: 0,
    });
    expect(summary.sections[0].rawSum).toBe(5);
    expect(summary.sections[0].answeredCount).toBe(1);
    expect(summary.sections[0].elevatedItemNumbers).toEqual([1]);
  });
});

describe("formatRawScoresForPrompt", () => {
  it("inclui nota de escala e totais", () => {
    const text = formatRawScoresForPrompt(
      computeItemProtocolRawScores(template, {
        a1: "S",
        a2: "N",
        a3: "N",
        t1: "N",
        t2: "N",
      }),
    );
    expect(text).toContain("T-scores");
    expect(text).toContain("Audição");
    expect(text).toContain("bruto");
  });
});
