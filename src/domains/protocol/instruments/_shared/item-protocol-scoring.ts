import type { ItemScaleId } from "./item-scale";
import type { ItemProtocolTemplate } from "./item-protocol-template";
import type { ProtocolOverallSummary } from "./protocol-score-summary";

type ScoreValue = number | string | null;

/** SPM bruto típico: N=1 … S=4. Sem reversão SOC (exige lista do manual). */
const SPM_RAW: Record<string, number> = { N: 1, O: 2, F: 3, S: 4 };

function maxPointsPerItem(scale: ItemScaleId): number {
  switch (scale) {
    case "pedi":
      return 1;
    case "spm":
      return 4;
    case "perfil-sensorial":
      return 5;
  }
}

function toRawPoints(scale: ItemScaleId, value: ScoreValue): number | null {
  if (value === null || value === undefined) return null;
  if (scale === "spm") {
    const n = SPM_RAW[String(value)];
    return n ?? null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (scale === "perfil-sensorial" && value === 0) return null; // N/A
    return value;
  }
  return null;
}

/**
 * Escore bruto por secção + % do máximo possível.
 * Não aplica T-scores, scaled scores nem reversão SOC do SPM.
 */
export function summarizeItemProtocol(
  template: ItemProtocolTemplate,
  scores: Record<string, ScoreValue>,
): ProtocolOverallSummary {
  const { scale } = template;
  const itemMax = maxPointsPerItem(scale);

  const domains = template.sections.map((section) => {
    let totalScore = 0;
    let maxScore = 0;

    for (const item of section.items) {
      const raw = scores[item.id] ?? null;
      const points = toRawPoints(scale, raw);

      if (scale === "perfil-sensorial" && raw === 0) {
        // N/A: fora da soma e do máximo
        continue;
      }

      maxScore += itemMax;
      if (points != null) totalScore += points;
    }

    return {
      domainId: section.id,
      title: section.title,
      totalScore,
      maxScore,
      percent: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
      itemCount: section.items.length,
    };
  });

  const totalScore = domains.reduce((sum, d) => sum + d.totalScore, 0);
  const maxScore = domains.reduce((sum, d) => sum + d.maxScore, 0);

  return {
    totalScore,
    maxScore,
    percent: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
    domains,
  };
}
