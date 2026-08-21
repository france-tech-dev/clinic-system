import type { Gmfm88OverallSummary } from "./evaluation-modules/fisioterapia/gmfm-88/scoring";

export type ProtocolScoreValue = number | string | null;

export type ProtocolEvaluationDTO = {
  id: string;
  patientId: string;
  patientName: string;
  memberId: string | null;
  professionalName: string | null;
  protocolId: string;
  label: string;
  date: string;
  scores: Record<string, ProtocolScoreValue>;
  notes: string;
  summary: Gmfm88OverallSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type ProtocolEvaluationComparisonDTO = {
  baseline: ProtocolEvaluationDTO;
  followUp: ProtocolEvaluationDTO;
  domainDeltas: {
    domainId: string;
    title: string;
    baselinePercent: number;
    followUpPercent: number;
    deltaPercent: number;
  }[];
  overallDeltaPercent: number;
};
