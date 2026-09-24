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
