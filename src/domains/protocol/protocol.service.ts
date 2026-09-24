import {
  ageYearsFromBirthDate,
  patientFirstName,
} from "./_lib/interpretationAI/prompt";
import {
  computeItemProtocolRawScores,
  formatRawScoresForPrompt,
} from "./_lib/interpretationAI/raw-section-scores";
import {
  ITEM_SCALE_OPTIONS,
  type ItemResponseValue,
} from "./instruments/_shared/item-scale";
import type { ProtocolOverallSummary } from "./instruments/_shared/protocol-score-summary";
import { getProtocolInstrument } from "./instruments/instruments";
import { protocolRepository } from "./protocol.repository";
import type {
  ProtocolAssessmentFormInput,
  UpdateProtocolAssessmentInput,
} from "./protocol.schema";
import type {
  ProtocolAssessmentComparisonDTO,
  ProtocolAssessmentDTO,
  ProtocolAssessmentPreviewDTO,
  ProtocolInterpretationAIContextDTO,
  ProtocolScoreValue,
} from "./protocol.types";

function parseScores(raw: string): Record<string, ProtocolScoreValue> {
  try {
    return JSON.parse(raw) as Record<string, ProtocolScoreValue>;
  } catch {
    return {};
  }
}

function parseSummary(
  raw: string | null | undefined,
): ProtocolOverallSummary | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProtocolOverallSummary;
  } catch {
    return null;
  }
}

function resolveSummary(
  protocolId: string,
  scores: Record<string, ProtocolScoreValue>,
): ProtocolOverallSummary | null {
  return getProtocolInstrument(protocolId)?.summarize(scores) ?? null;
}

function serializeSummary(
  summary: ProtocolOverallSummary | null,
): string | null {
  return summary ? JSON.stringify(summary) : null;
}

type ProtocolAssessmentRow = NonNullable<
  Awaited<ReturnType<typeof protocolRepository.findById>>
>;

function toDTO(row: ProtocolAssessmentRow): ProtocolAssessmentDTO {
  const scores = parseScores(row.scores);
  const summary =
    parseSummary(row.summary) ?? resolveSummary(row.protocolId, scores);

  return {
    id: row.id,
    patientId: row.patientId,
    patientName: row.patient.name,
    memberId: row.memberId,
    professionalName: row.member?.user.name?.trim() || null,
    protocolId: row.protocolId,
    label: row.label,
    date: row.date,
    scores,
    notes: row.notes,
    interpretationAI: row.interpretationAI ?? null,
    interpretationAIUpdatedAt: row.interpretationAIUpdatedAt
      ? row.interpretationAIUpdatedAt.toISOString()
      : null,
    summary,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function resolveProtocolAuthorMemberId(
  organizationId: string,
  userId: string,
): Promise<string | null> {
  const member = await protocolRepository.findMemberByUserId(
    organizationId,
    userId,
  );
  return member?.id ?? null;
}

export async function listProtocolAssessments(
  organizationId: string,
  patientId: string,
  protocolId?: string,
) {
  const rows = await protocolRepository.findByPatient(
    organizationId,
    patientId,
    protocolId,
  );
  return rows.map(toDTO);
}

export async function getProtocolAssessment(
  organizationId: string,
  id: string,
) {
  const row = await protocolRepository.findById(organizationId, id);
  return row ? toDTO(row) : null;
}

export async function getProtocolAssessmentPreview(
  organizationId: string,
  id: string,
): Promise<ProtocolAssessmentPreviewDTO | null> {
  const row = await protocolRepository.findById(organizationId, id);
  if (!row) return null;
  const dto = toDTO(row);
  const mod = getProtocolInstrument(dto.protocolId);
  const template = mod?.template;
  if (!template) {
    return {
      id: dto.id,
      protocolId: dto.protocolId,
      protocolName: mod?.name ?? dto.label,
      date: dto.date,
      interpretationAI: dto.interpretationAI,
      interpretationAIUpdatedAt: dto.interpretationAIUpdatedAt,
      sections: [],
    };
  }

  const options = ITEM_SCALE_OPTIONS[template.scale];
  function valueLabel(raw: unknown): string {
    if (raw === null || raw === undefined) return "—";
    const opt = options.find((o) => String(o.value) === String(raw));
    return opt ? `${opt.value} · ${opt.label}` : String(raw);
  }

  return {
    id: dto.id,
    protocolId: dto.protocolId,
    protocolName: mod.name,
    date: dto.date,
    interpretationAI: dto.interpretationAI,
    interpretationAIUpdatedAt: dto.interpretationAIUpdatedAt,
    sections: template.sections.map((section) => ({
      id: section.id,
      title: section.title,
      items: section.items.map((item) => ({
        id: item.id,
        label: item.label,
        valueLabel: valueLabel(dto.scores[item.id] as ItemResponseValue | null),
      })),
    })),
  };
}

export async function getProtocolInterpretationAIContext(
  organizationId: string,
  id: string,
): Promise<ProtocolInterpretationAIContextDTO | null> {
  const row = await protocolRepository.findById(organizationId, id);
  if (!row) return null;

  const preview = await getProtocolAssessmentPreview(organizationId, id);
  if (!preview) return null;

  const dto = toDTO(row);
  const mod = getProtocolInstrument(dto.protocolId);
  const template = mod?.template;
  const rawScoresText =
    template != null
      ? formatRawScoresForPrompt(
          computeItemProtocolRawScores(template, dto.scores),
        )
      : null;

  return {
    preview,
    patientFirstName: patientFirstName(row.patient.name),
    patientAgeYears: ageYearsFromBirthDate(row.patient.birthDate),
    rawScoresText,
  };
}

export async function saveProtocolInterpretationAI(
  organizationId: string,
  id: string,
  interpretationAI: string | null,
) {
  const row = await protocolRepository.updateInterpretationAI(
    organizationId,
    id,
    interpretationAI,
  );
  return row ? toDTO(row) : null;
}

export async function createProtocolAssessment(
  organizationId: string,
  data: ProtocolAssessmentFormInput,
  memberId: string | null,
) {
  const summary = serializeSummary(
    resolveSummary(
      data.protocolId,
      data.scores as Record<string, ProtocolScoreValue>,
    ),
  );
  const row = await protocolRepository.create(organizationId, data, memberId, {
    summary,
  });
  return row ? toDTO(row) : null;
}

export async function updateProtocolAssessment(
  organizationId: string,
  data: UpdateProtocolAssessmentInput,
) {
  const summary = serializeSummary(
    resolveSummary(
      data.protocolId,
      data.scores as Record<string, ProtocolScoreValue>,
    ),
  );
  const row = await protocolRepository.update(organizationId, data, {
    summary,
  });
  return row ? toDTO(row) : null;
}

export async function deleteProtocolAssessment(
  organizationId: string,
  id: string,
) {
  const row = await protocolRepository.delete(organizationId, id);
  return row ? toDTO(row) : null;
}

export async function compareProtocolAssessments(
  organizationId: string,
  baselineId: string,
  followUpId: string,
): Promise<ProtocolAssessmentComparisonDTO | null> {
  const [baselineRow, followUpRow] = await Promise.all([
    protocolRepository.findById(organizationId, baselineId),
    protocolRepository.findById(organizationId, followUpId),
  ]);
  if (!baselineRow || !followUpRow) return null;
  if (baselineRow.patientId !== followUpRow.patientId) return null;
  if (baselineRow.protocolId !== followUpRow.protocolId) return null;

  const baseline = toDTO(baselineRow);
  const followUp = toDTO(followUpRow);
  if (!baseline.summary || !followUp.summary) return null;

  const domainDeltas = baseline.summary.domains.map((baseDomain) => {
    const followDomain = followUp.summary!.domains.find(
      (d) => d.domainId === baseDomain.domainId,
    )!;
    return {
      domainId: baseDomain.domainId,
      title: baseDomain.title,
      baselinePercent: baseDomain.percent,
      followUpPercent: followDomain.percent,
      deltaPercent: followDomain.percent - baseDomain.percent,
    };
  });

  return {
    baseline,
    followUp,
    domainDeltas,
    overallDeltaPercent: followUp.summary.percent - baseline.summary.percent,
  };
}
