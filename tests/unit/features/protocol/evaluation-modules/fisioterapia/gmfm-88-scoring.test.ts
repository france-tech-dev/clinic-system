import { describe, expect, it } from "vitest";
import {
  emptyGmfm88Scores,
  summarizeGmfm88,
  summarizeGmfm88Domain,
} from "@/domains/protocol/evaluation-modules/fisioterapia/gmfm-88/scoring";

describe("summarizeGmfm88Domain", () => {
  it("calcula total e percentual do domínio A", () => {
    const scores = emptyGmfm88Scores();
    scores.A01 = 3;
    scores.A02 = 2;

    const summary = summarizeGmfm88Domain(scores, "A");
    expect(summary).not.toBeNull();
    expect(summary!.totalScore).toBe(5);
    expect(summary!.maxScore).toBe(17 * 3);
  });
});

describe("summarizeGmfm88", () => {
  it("agrega todos os domínios", () => {
    const scores = emptyGmfm88Scores();
    scores.A01 = 3;
    scores.B01 = 1;

    const summary = summarizeGmfm88(scores);
    expect(summary.totalScore).toBe(4);
    expect(summary.maxScore).toBe(88 * 3);
    expect(summary.domains).toHaveLength(5);
  });
});

describe("emptyGmfm88Scores", () => {
  it("inicializa 88 itens", () => {
    const scores = emptyGmfm88Scores();
    expect(Object.keys(scores)).toHaveLength(88);
  });
});
