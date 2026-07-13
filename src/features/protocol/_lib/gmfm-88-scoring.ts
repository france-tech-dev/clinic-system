import {
  GMFM88_MAX_ITEM_SCORE,
  GMFM88_TEMPLATE,
  type Gmfm88Domain,
} from "./gmfm-88-template";

export type Gmfm88Scores = Record<string, number | null | undefined>;

export type Gmfm88DomainSummary = {
  domainId: string;
  title: string;
  totalScore: number;
  maxScore: number;
  percent: number;
  itemCount: number;
};

export type Gmfm88OverallSummary = {
  totalScore: number;
  maxScore: number;
  percent: number;
  domains: Gmfm88DomainSummary[];
};

function domainMaxScore(domain: Gmfm88Domain): number {
  return domain.items.length * GMFM88_MAX_ITEM_SCORE;
}

function scoreValue(scores: Gmfm88Scores, itemId: string): number {
  const raw = scores[itemId];
  if (raw === null || raw === undefined || Number.isNaN(raw)) return 0;
  return Math.max(0, Math.min(GMFM88_MAX_ITEM_SCORE, Math.round(raw)));
}

export function summarizeGmfm88Domain(
  scores: Gmfm88Scores,
  domainId: string,
): Gmfm88DomainSummary | null {
  const domain = GMFM88_TEMPLATE.domains.find((d) => d.id === domainId);
  if (!domain) return null;

  const totalScore = domain.items.reduce(
    (sum, item) => sum + scoreValue(scores, item.id),
    0,
  );
  const maxScore = domainMaxScore(domain);

  return {
    domainId: domain.id,
    title: domain.title,
    totalScore,
    maxScore,
    percent: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
    itemCount: domain.items.length,
  };
}

export function summarizeGmfm88(scores: Gmfm88Scores): Gmfm88OverallSummary {
  const domains = GMFM88_TEMPLATE.domains.map(
    (d) => summarizeGmfm88Domain(scores, d.id)!,
  );
  const totalScore = domains.reduce((sum, d) => sum + d.totalScore, 0);
  const maxScore = domains.reduce((sum, d) => sum + d.maxScore, 0);

  return {
    totalScore,
    maxScore,
    percent: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
    domains,
  };
}

export function emptyGmfm88Scores(): Gmfm88Scores {
  const scores: Gmfm88Scores = {};
  for (const domain of GMFM88_TEMPLATE.domains) {
    for (const item of domain.items) {
      scores[item.id] = null;
    }
  }
  return scores;
}
