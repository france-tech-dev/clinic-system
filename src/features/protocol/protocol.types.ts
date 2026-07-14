import type { Gmfm88OverallSummary } from "./_lib/gmfm-88-scoring";

export type ProtocolAssessmentDTO = {
  id: string;
  patientId: string;
  patientName: string;
  memberId: string | null;
  professionalName: string | null;
  protocolId: string;
  label: string;
  date: string;
  scores: Record<string, number | null>;
  notes: string;
  summary: Gmfm88OverallSummary | null;
  createdAt: string;
  updatedAt: string;
};

export type ProtocolComparisonDTO = {
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
