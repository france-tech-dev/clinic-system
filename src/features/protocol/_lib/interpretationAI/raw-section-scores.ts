import type {
  ItemScaleId,
  ItemResponseValue,
} from "@/features/protocol/evaluation-modules/_shared/item-scale";
import type { ItemProtocolTemplate } from "@/features/protocol/evaluation-modules/_shared/item-protocol-template";
import type { ProtocolScoreValue } from "@/features/protocol/protocol.types";

export type SectionRawScore = {
  sectionId: string;
  title: string;
  /** Soma bruta dos itens respondidos (escala do instrumento). */
  rawSum: number;
  answeredCount: number;
  itemCount: number;
  /** Itens com resposta "elevada" na escala (útil para a IA focar). */
  elevatedItemNumbers: number[];
};

export type ProtocolRawScoresSummary = {
  scale: ItemScaleId;
  /** Explica a conversão numérica — sem T-scores/bandas. */
  scaleNote: string;
  sections: SectionRawScore[];
};

/** SPM bruto típico: N=1 … S=4 (nunca inventar T-score a partir disto). */
const SPM_RAW: Record<string, number> = { N: 1, O: 2, F: 3, S: 4 };

function toRawPoints(
  scale: ItemScaleId,
  value: ProtocolScoreValue,
): number | null {
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

function isElevated(scale: ItemScaleId, value: ProtocolScoreValue): boolean {
  if (value === null || value === undefined) return false;
  if (scale === "spm") return value === "F" || value === "S";
  if (scale === "perfil-sensorial") {
    return value === 4 || value === 5;
  }
  // PEDI: "Não realiza" (0) costuma ser o achado relevante
  return value === 0;
}

function scaleNote(scale: ItemScaleId): string {
  switch (scale) {
    case "spm":
      return "SPM bruto: N=1, O=2, F=3, S=4. Sem T-scores nem bandas normativas.";
    case "pedi":
      return "PEDI: 0=Não realiza, 1=Realiza. Soma bruta por secção.";
    case "perfil-sensorial":
      return "Perfil Sensorial: 5→1 (frequência); 0=Não se aplica (excluído da soma).";
  }
}

/**
 * Agregação determinística por secção a partir das respostas.
 * Não calcula T-scores / percentis / bandas oficiais.
 */
export function computeItemProtocolRawScores(
  template: ItemProtocolTemplate,
  scores: Record<string, ProtocolScoreValue>,
): ProtocolRawScoresSummary {
  const { scale } = template;

  const sections = template.sections.map((section) => {
    let rawSum = 0;
    let answeredCount = 0;
    const elevatedItemNumbers: number[] = [];

    section.items.forEach((item, index) => {
      const raw = scores[item.id] as ItemResponseValue | null | undefined;
      const points = toRawPoints(scale, raw ?? null);
      if (points != null) {
        rawSum += points;
        answeredCount += 1;
      }
      if (isElevated(scale, raw ?? null)) {
        elevatedItemNumbers.push(index + 1);
      }
    });

    return {
      sectionId: section.id,
      title: section.title,
      rawSum,
      answeredCount,
      itemCount: section.items.length,
      elevatedItemNumbers,
    };
  });

  return { scale, scaleNote: scaleNote(scale), sections };
}

export function formatRawScoresForPrompt(
  summary: ProtocolRawScoresSummary,
): string {
  const lines = summary.sections.map((s) => {
    const elevated =
      s.elevatedItemNumbers.length > 0
        ? ` · itens elevados: ${s.elevatedItemNumbers.join(", ")}`
        : " · sem itens elevados";
    return `- ${s.title}: bruto ${s.rawSum} (${s.answeredCount}/${s.itemCount} respondidos)${elevated}`;
  });
  return [`Escalas: ${summary.scaleNote}`, ...lines].join("\n");
}
