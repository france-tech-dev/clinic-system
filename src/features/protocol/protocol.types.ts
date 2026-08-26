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
  interpretationAI: string | null;
  interpretationAIUpdatedAt: string | null;
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

export type ProtocolEvaluationPreviewDTO = {
  id: string;
  protocolId: string;
  protocolName: string;
  date: string;
  interpretationAI: string | null;
  interpretationAIUpdatedAt: string | null;
  sections: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      label: string;
      valueLabel: string;
    }>;
  }>;
};

export type ProtocolInterpretationAIContextDTO = {
  preview: ProtocolEvaluationPreviewDTO;
  patientFirstName: string;
  patientAgeYears: number | null;
};
