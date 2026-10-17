import { GMFM88_TEMPLATE } from "@/domains/protocol/instruments/fisioterapia/gmfm-88/template";
import type {
  ProtocolAssessmentComparisonDTO,
  ProtocolAssessmentDTO,
} from "@/domains/protocol/protocol.types";
import type {
  GmfmPdfComparisonPayload,
  GmfmPdfResponsesPayload,
  GmfmPdfScoresPayload,
} from "./types";

function scoreLabel(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export function buildGmfmResponsesPdfPayload(opts: {
  assessment: ProtocolAssessmentDTO;
  protocolName: string;
}): GmfmPdfResponsesPayload {
  const { assessment, protocolName } = opts;

  return {
    kind: "responses",
    protocolName,
    patientName: assessment.patientName,
    professionalName: assessment.professionalName,
    date: assessment.date,
    label: assessment.label,
    domains: GMFM88_TEMPLATE.domains.map((domain) => ({
      title: `${domain.id}: ${domain.title}`,
      items: domain.items.map((item) => ({
        id: item.id,
        label: item.label,
        value: scoreLabel(assessment.scores[item.id]),
      })),
    })),
  };
}

export function buildGmfmScoresPdfPayload(opts: {
  assessment: ProtocolAssessmentDTO;
  protocolName: string;
}): GmfmPdfScoresPayload | null {
  const { assessment, protocolName } = opts;
  if (!assessment.summary) return null;

  return {
    kind: "scores",
    protocolName,
    patientName: assessment.patientName,
    professionalName: assessment.professionalName,
    date: assessment.date,
    label: assessment.label,
    totalScore: assessment.summary.totalScore,
    maxScore: assessment.summary.maxScore,
    percent: assessment.summary.percent,
    domains: assessment.summary.domains,
  };
}

export function buildGmfmComparisonPdfPayload(opts: {
  comparison: ProtocolAssessmentComparisonDTO;
  protocolName: string;
}): GmfmPdfComparisonPayload | null {
  const { comparison, protocolName } = opts;
  if (!comparison.baseline.summary || !comparison.followUp.summary) return null;

  return {
    kind: "comparison",
    protocolName,
    patientName: comparison.baseline.patientName,
    baselineLabel: comparison.baseline.label,
    baselineDate: comparison.baseline.date,
    followUpLabel: comparison.followUp.label,
    followUpDate: comparison.followUp.date,
    baselinePercent: comparison.baseline.summary.percent,
    followUpPercent: comparison.followUp.summary.percent,
    overallDeltaPercent: comparison.overallDeltaPercent,
    domains: comparison.domainDeltas.map((d) => ({
      title: d.title,
      baselinePercent: d.baselinePercent,
      followUpPercent: d.followUpPercent,
      deltaPercent: d.deltaPercent,
    })),
  };
}
