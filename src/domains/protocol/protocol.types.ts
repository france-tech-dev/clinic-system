import type { ProtocolOverallSummary } from "./instruments/_shared/protocol-score-summary";

export type ProtocolScoreValue = number | string | null;

export type ProtocolAssessmentDTO = {
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
  summary: ProtocolOverallSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type ProtocolAssessmentComparisonDTO = {
  baseline: ProtocolAssessmentDTO;
  followUp: ProtocolAssessmentDTO;
  domainDeltas: {
    domainId: string;
    title: string;
    baselinePercent: number;
    followUpPercent: number;
    deltaPercent: number;
  }[];
  overallDeltaPercent: number;
};

export type ProtocolAssessmentPreviewDTO = {
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
  preview: ProtocolAssessmentPreviewDTO;
  patientFirstName: string;
  patientAgeYears: number | null;
  rawScoresText: string | null;
};
