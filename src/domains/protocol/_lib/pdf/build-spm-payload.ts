import type { ItemProtocolTemplate } from "@/domains/protocol/instruments/_shared/item-protocol-template";
import {
  ITEM_SCALE_OPTIONS,
  type ItemResponseValue,
} from "@/domains/protocol/instruments/_shared/item-scale";
import { isSpmSummary } from "@/domains/protocol/instruments/terapia-ocupacional/_lib/spm/score";
import type { ProtocolAssessmentDTO } from "@/domains/protocol/protocol.types";
import type { SpmPdfResponsesPayload, SpmPdfScoresPayload } from "./types";

function valueLabel(value: ItemResponseValue | null | undefined): string {
  if (value == null) return "—";
  const opt = ITEM_SCALE_OPTIONS.spm.find((o) => o.value === value);
  return opt ? `${value} — ${opt.label}` : String(value);
}

export function buildSpmResponsesPdfPayload(opts: {
  assessment: ProtocolAssessmentDTO;
  protocolName: string;
  template: ItemProtocolTemplate;
}): SpmPdfResponsesPayload {
  const { assessment, protocolName, template } = opts;
  let n = 0;
  const sections = template.sections.map((section) => ({
    title: `${section.id.toUpperCase()}: ${section.title}`,
    items: section.items.map((item) => {
      n += 1;
      return {
        number: n,
        label: item.label,
        value: valueLabel(
          assessment.scores[item.id] as ItemResponseValue | null,
        ),
      };
    }),
  }));

  return {
    kind: "responses",
    protocolName,
    patientName: assessment.patientName,
    professionalName: assessment.professionalName,
    date: assessment.date,
    label: assessment.label,
    sections,
  };
}

export function buildSpmScoresPdfPayload(opts: {
  assessment: ProtocolAssessmentDTO;
  protocolName: string;
}): SpmPdfScoresPayload | null {
  const { assessment, protocolName } = opts;
  if (!isSpmSummary(assessment.summary)) return null;

  return {
    kind: "scores",
    protocolName,
    patientName: assessment.patientName,
    professionalName: assessment.professionalName,
    date: assessment.date,
    label: assessment.label,
    hasNorms: assessment.summary.hasNorms,
    scales: assessment.summary.scales,
  };
}
