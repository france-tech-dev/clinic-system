import { GMFM88_PROTOCOL_ID } from "./_lib/gmfm-88-template";
import {
  summarizeGmfm88,
  type Gmfm88Scores,
} from "./_lib/gmfm-88-scoring";
import { protocolRepository } from "./protocol.repository";
import type {
  ProtocolAssessmentFormInput,
  UpdateProtocolAssessmentInput,
} from "./protocol.schema";
import type {
  ProtocolAssessmentDTO,
  ProtocolComparisonDTO,
} from "./protocol.types";

function parseScores(raw: string): Record<string, number | null> {
  try {
    return JSON.parse(raw) as Record<string, number | null>;
  } catch {
    return {};
  }
}

function toDTO(row: {
  id: string;
  patientId: string;
  protocolId: string;
  label: string;
  date: string;
  scores: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; name: string };
}): ProtocolAssessmentDTO {
  const scores = parseScores(row.scores);
  const summary =
    row.protocolId === GMFM88_PROTOCOL_ID
      ? summarizeGmfm88(scores as Gmfm88Scores)
      : null;

  return {
    id: row.id,
    patientId: row.patientId,
    patientName: row.patient.name,
    protocolId: row.protocolId,
    label: row.label,
    date: row.date,
    scores,
    notes: row.notes,
    summary,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
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

export async function createProtocolAssessment(
  organizationId: string,
  data: ProtocolAssessmentFormInput,
) {
  const row = await protocolRepository.create(organizationId, data);
  return row ? toDTO(row) : null;
}

export async function updateProtocolAssessment(
  organizationId: string,
  data: UpdateProtocolAssessmentInput,
) {
  const row = await protocolRepository.update(organizationId, data);
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
): Promise<ProtocolComparisonDTO | null> {
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
    overallDeltaPercent:
      followUp.summary.percent - baseline.summary.percent,
  };
}
