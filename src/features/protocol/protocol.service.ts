import { GMFM88_PROTOCOL_ID } from "./evaluation-modules/fisioterapia/gmfm-88/template";
import {
  summarizeGmfm88,
  type Gmfm88Scores,
} from "./evaluation-modules/fisioterapia/gmfm-88/scoring";
import { protocolRepository } from "./protocol.repository";
import type {
  ProtocolEvaluationFormInput,
  UpdateProtocolEvaluationInput,
} from "./protocol.schema";
import type {
  ProtocolEvaluationDTO,
  ProtocolEvaluationComparisonDTO,
} from "./protocol.types";

function parseScores(raw: string): Record<string, number | string | null> {
  try {
    return JSON.parse(raw) as Record<string, number | string | null>;
  } catch {
    return {};
  }
}

type ProtocolEvaluationRow = NonNullable<
  Awaited<ReturnType<typeof protocolRepository.findById>>
>;

function toDTO(row: ProtocolEvaluationRow): ProtocolEvaluationDTO {
  const scores = parseScores(row.scores);
  const summary =
    row.protocolId === GMFM88_PROTOCOL_ID
      ? summarizeGmfm88(scores as Gmfm88Scores)
      : null;

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

export async function listProtocolEvaluations(
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

export async function getProtocolEvaluation(
  organizationId: string,
  id: string,
) {
  const row = await protocolRepository.findById(organizationId, id);
  return row ? toDTO(row) : null;
}

export async function createProtocolEvaluation(
  organizationId: string,
  data: ProtocolEvaluationFormInput,
  memberId: string | null,
) {
  const row = await protocolRepository.create(organizationId, data, memberId);
  return row ? toDTO(row) : null;
}

export async function updateProtocolEvaluation(
  organizationId: string,
  data: UpdateProtocolEvaluationInput,
) {
  const row = await protocolRepository.update(organizationId, data);
  return row ? toDTO(row) : null;
}

export async function deleteProtocolEvaluation(
  organizationId: string,
  id: string,
) {
  const row = await protocolRepository.delete(organizationId, id);
  return row ? toDTO(row) : null;
}

export async function compareProtocolEvaluations(
  organizationId: string,
  baselineId: string,
  followUpId: string,
): Promise<ProtocolEvaluationComparisonDTO | null> {
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
