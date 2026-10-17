import type { ProtocolDomainSummary } from "@/domains/protocol/instruments/_shared/protocol-score-summary";
import type { SpmScaleRow } from "@/domains/protocol/instruments/terapia-ocupacional/_lib/spm/score";

export type SpmPdfResponsesPayload = {
  kind: "responses";
  protocolName: string;
  patientName: string;
  professionalName: string | null;
  date: string;
  label: string;
  sections: Array<{
    title: string;
    items: Array<{ number: number; label: string; value: string }>;
  }>;
};

export type SpmPdfScoresPayload = {
  kind: "scores";
  protocolName: string;
  patientName: string;
  professionalName: string | null;
  date: string;
  label: string;
  hasNorms: boolean;
  scales: SpmScaleRow[];
};

export type SpmPdfPayload = SpmPdfResponsesPayload | SpmPdfScoresPayload;

export type GmfmPdfResponsesPayload = {
  kind: "responses";
  protocolName: string;
  patientName: string;
  professionalName: string | null;
  date: string;
  label: string;
  domains: Array<{
    title: string;
    items: Array<{ id: string; label: string; value: string }>;
  }>;
};

export type GmfmPdfScoresPayload = {
  kind: "scores";
  protocolName: string;
  patientName: string;
  professionalName: string | null;
  date: string;
  label: string;
  totalScore: number;
  maxScore: number;
  percent: number;
  domains: ProtocolDomainSummary[];
};

export type GmfmPdfComparisonPayload = {
  kind: "comparison";
  protocolName: string;
  patientName: string;
  baselineLabel: string;
  baselineDate: string;
  followUpLabel: string;
  followUpDate: string;
  baselinePercent: number;
  followUpPercent: number;
  overallDeltaPercent: number;
  domains: Array<{
    title: string;
    baselinePercent: number;
    followUpPercent: number;
    deltaPercent: number;
  }>;
};

export type GmfmPdfPayload =
  GmfmPdfResponsesPayload | GmfmPdfScoresPayload | GmfmPdfComparisonPayload;
