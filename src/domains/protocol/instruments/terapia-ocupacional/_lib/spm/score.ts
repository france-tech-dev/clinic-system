import type { ItemProtocolTemplate } from "../../../_shared/item-protocol-template";
import type {
  ProtocolDomainSummary,
  ProtocolOverallSummary,
} from "../../../_shared/protocol-score-summary";

/** Escalas do SPM (legado). TAS não tem coluna T no AutoScore Casa 5–12. */
export type SpmScaleCode =
  "SOC" | "VIS" | "HEA" | "TOU" | "TAS" | "BOD" | "BAL" | "PLA" | "TOT";

export type SpmNormedScaleCode = Exclude<SpmScaleCode, "TAS">;

export type SpmBand = "typical" | "some_problems" | "definite_dysfunction";

export type SpmNormEntry = { tScore: number; percentile: number };

export type SpmNormsTable = Record<
  SpmNormedScaleCode,
  ReadonlyMap<number, SpmNormEntry>
>;

export type SpmScaleRow = {
  code: SpmScaleCode;
  domainId: string;
  title: string;
  raw: number;
  maxRaw: number;
  tScore: number | null;
  percentile: number | null;
  band: SpmBand | null;
};

/** Summary SPM = overall + linhas por escala (inclui TOT). */
export type SpmSummary = ProtocolOverallSummary & {
  kind: "spm";
  scales: SpmScaleRow[];
  hasNorms: boolean;
};

const SPM_POINTS: Record<string, number> = { N: 1, O: 2, F: 3, S: 4 };

const SECTION_TO_CODE: Record<string, Exclude<SpmScaleCode, "TOT">> = {
  "participacao-social": "SOC",
  visao: "VIS",
  audicao: "HEA",
  tato: "TOU",
  "olfato-e-paladar": "TAS",
  "consciencia-corporal": "BOD",
  "equilibrio-e-movimento": "BAL",
  "planejamento-e-ideacao": "PLA",
};

/** Escalas que somam no TOT (exclui SOC e PLA). */
const TOT_CODES = new Set<SpmScaleCode>([
  "VIS",
  "HEA",
  "TOU",
  "TAS",
  "BOD",
  "BAL",
]);

export const SPM_BAND_LABELS: Record<SpmBand, string> = {
  typical: "Típico (40T–59T)",
  some_problems: "Alguns problemas (60T–69T)",
  definite_dysfunction: "Disfunção definida (70T–80T)",
};

export function bandFromTScore(tScore: number): SpmBand {
  if (tScore >= 70) return "definite_dysfunction";
  if (tScore >= 60) return "some_problems";
  return "typical";
}

/** Itens de redação positiva: N=4 … S=1. */
function isReversedItem(sectionId: string, itemId: string): boolean {
  if (sectionId === "participacao-social") return true;
  return itemId === "equilibrio-e-movimento-02";
}

function toPoints(
  sectionId: string,
  itemId: string,
  value: number | string | null | undefined,
): number | null {
  if (value == null) return null;
  const base = SPM_POINTS[String(value)];
  if (base == null) return null;
  return isReversedItem(sectionId, itemId) ? 5 - base : base;
}

function lookupNorm(
  norms: SpmNormsTable | null,
  code: SpmNormedScaleCode,
  raw: number,
): SpmNormEntry | null {
  if (!norms) return null;
  return norms[code].get(raw) ?? null;
}

/**
 * Calcula raw (com reversão), T-score/bandas quando houver normas, e TOT.
 */
export function scoreSpm(
  template: ItemProtocolTemplate,
  scores: Record<string, number | string | null>,
  norms: SpmNormsTable | null = null,
): SpmSummary {
  const scales: SpmScaleRow[] = [];
  const domains: ProtocolDomainSummary[] = [];
  let totRaw = 0;
  let totMax = 0;

  for (const section of template.sections) {
    const code = SECTION_TO_CODE[section.id];
    if (!code) continue;

    let raw = 0;
    const maxRaw = section.items.length * 4;

    for (const item of section.items) {
      const points = toPoints(section.id, item.id, scores[item.id] ?? null);
      if (points != null) raw += points;
    }

    const norm = code !== "TAS" ? lookupNorm(norms, code, raw) : null;

    scales.push({
      code,
      domainId: section.id,
      title: section.title,
      raw,
      maxRaw,
      tScore: norm?.tScore ?? null,
      percentile: norm?.percentile ?? null,
      band: norm ? bandFromTScore(norm.tScore) : null,
    });

    domains.push({
      domainId: section.id,
      title: section.title,
      totalScore: raw,
      maxScore: maxRaw,
      percent: maxRaw > 0 ? (raw / maxRaw) * 100 : 0,
      itemCount: section.items.length,
    });

    if (TOT_CODES.has(code)) {
      totRaw += raw;
      totMax += maxRaw;
    }
  }

  const totNorm = lookupNorm(norms, "TOT", totRaw);
  scales.push({
    code: "TOT",
    domainId: "tot",
    title: "Total sensorial",
    raw: totRaw,
    maxRaw: totMax,
    tScore: totNorm?.tScore ?? null,
    percentile: totNorm?.percentile ?? null,
    band: totNorm ? bandFromTScore(totNorm.tScore) : null,
  });

  const totalScore = scales
    .filter((s) => s.code !== "TOT")
    .reduce((sum, s) => sum + s.raw, 0);
  const maxScore = scales
    .filter((s) => s.code !== "TOT")
    .reduce((sum, s) => sum + s.maxRaw, 0);

  return {
    kind: "spm",
    totalScore,
    maxScore,
    percent: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
    domains,
    scales,
    hasNorms: norms != null,
  };
}

export function isSpmSummary(
  summary: ProtocolOverallSummary | null | undefined,
): summary is SpmSummary {
  return (
    summary != null &&
    "kind" in summary &&
    (summary as SpmSummary).kind === "spm" &&
    Array.isArray((summary as SpmSummary).scales)
  );
}
