import {
  getEvaluationModule,
  listEvaluationModules,
} from "@/features/protocol/evaluation-modules/registry";
import {
  createItemResponseSchema,
  listItemProtocolItemIds,
  parseItemProtocolResponses,
  type ItemProtocolTemplate,
} from "@/features/protocol/evaluation-modules/_shared/item-protocol-template";
import { paths } from "@/shared/constants/paths";
import { protocolInviteRepository } from "./protocol-invite.repository";
import { createProtocolInviteToken } from "./_lib/token";
import { computeInviteFlags } from "./_lib/invite-status";
import type {
  CreateProtocolInviteInput,
  SubmitPublicInviteInput,
} from "./protocol-invite.schema";
import type {
  ProtocolInviteDTO,
  ProtocolInviteItemDTO,
  PublicProtocolInviteDTO,
  PublicProtocolInviteInstrumentDTO,
} from "./protocol-invite.types";

type InviteRow = NonNullable<
  Awaited<ReturnType<typeof protocolInviteRepository.findByToken>>
>;

function firstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || "paciente";
}

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function getItemTemplate(protocolId: string): ItemProtocolTemplate | null {
  const mod = getEvaluationModule(protocolId);
  return mod?.template ?? null;
}

function protocolName(protocolId: string): string {
  return getEvaluationModule(protocolId)?.name ?? protocolId;
}

function parseResponsesJson(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function inviteFlags(row: InviteRow, now = new Date()) {
  return computeInviteFlags(
    {
      revokedAt: row.revokedAt,
      expiresAt: row.expiresAt,
      itemStatuses: row.items.map((item) => item.status),
    },
    now,
  );
}

function toItemDTO(item: InviteRow["items"][number]): ProtocolInviteItemDTO {
  const template = getItemTemplate(item.protocolId);
  return {
    id: item.id,
    protocolId: item.protocolId,
    protocolName: protocolName(item.protocolId),
    status: item.status === "submitted" ? "submitted" : "pending",
    totalCount: template ? listItemProtocolItemIds(template).length : 0,
    submittedAt: item.submittedAt?.toISOString() ?? null,
    evaluationId: item.evaluation?.id ?? null,
  };
}

function toDTO(row: InviteRow, origin?: string): ProtocolInviteDTO {
  const flags = inviteFlags(row);
  const publicPath = paths.avaliacaoPublica.byToken(row.token);
  return {
    id: row.id,
    token: row.token,
    publicUrl: origin ? `${origin}${publicPath}` : publicPath,
    patientId: row.patientId,
    patientName: row.patient.name,
    organizationId: row.organizationId,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    revokedAt: row.revokedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    items: row.items.map(toItemDTO),
    ...flags,
  };
}

function assertPublicInviteable(protocolIds: string[]) {
  for (const protocolId of protocolIds) {
    const mod = getEvaluationModule(protocolId);
    if (!mod?.supportsPublicInvite || !mod.template) {
      throw new Error(
        `Instrumento não disponível para link público: ${protocolId}`,
      );
    }
  }
}

export async function createProtocolInvite(
  organizationId: string,
  userId: string,
  input: CreateProtocolInviteInput,
  origin?: string,
) {
  const uniqueIds = [...new Set(input.protocolIds)];
  assertPublicInviteable(uniqueIds);

  const patient = await protocolInviteRepository.findPatient(
    organizationId,
    input.patientId,
  );
  if (!patient) return null;

  const member = await protocolInviteRepository.findMemberByUserId(
    organizationId,
    userId,
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

  const row = await protocolInviteRepository.create({
    token: createProtocolInviteToken(),
    organizationId,
    patientId: input.patientId,
    createdByMemberId: member?.id ?? null,
    expiresAt,
    protocolIds: uniqueIds,
  });

  return toDTO(row, origin);
}

export async function listProtocolInvites(
  organizationId: string,
  patientId: string,
  origin?: string,
) {
  const rows = await protocolInviteRepository.findByPatient(
    organizationId,
    patientId,
  );
  return rows.map((row) => toDTO(row, origin));
}

export async function revokeProtocolInvite(
  organizationId: string,
  id: string,
  origin?: string,
) {
  const row = await protocolInviteRepository.revoke(organizationId, id);
  return row ? toDTO(row, origin) : null;
}

export async function deleteProtocolInvite(
  organizationId: string,
  id: string,
  origin?: string,
) {
  const existing = await protocolInviteRepository.findById(organizationId, id);
  if (!existing) return null;
  const flags = inviteFlags(existing);
  if (flags.isActive) {
    throw new Error(
      "Revogue o link activo antes de excluir, ou aguarde expirar.",
    );
  }
  const row = await protocolInviteRepository.delete(organizationId, id);
  return row ? toDTO(row, origin) : null;
}

export async function getPublicProtocolInvite(
  token: string,
): Promise<PublicProtocolInviteDTO | null> {
  const row = await protocolInviteRepository.findByToken(token);
  if (!row) return null;
  const flags = inviteFlags(row);
  if (!flags.isActive) return null;

  return {
    token: row.token,
    patientFirstName: firstName(row.patient.name),
    patientInitials: initials(row.patient.name),
    therapistName: row.createdByMember?.user.name?.trim() || null,
    clinicName: row.organization.name.trim() || "Clínica",
    expiresAt: row.expiresAt?.toISOString() ?? null,
    allSubmitted: flags.allSubmitted,
    items: row.items.map((item) => ({
      ...toItemDTO(item),
      evaluationId: null,
    })),
  };
}

export async function getPublicProtocolInviteInstrument(
  token: string,
  protocolId: string,
): Promise<PublicProtocolInviteInstrumentDTO | null> {
  const row = await protocolInviteRepository.findByToken(token);
  if (!row) return null;
  const flags = inviteFlags(row);
  if (!flags.isActive) return null;

  const item = row.items.find((i) => i.protocolId === protocolId);
  if (!item) return null;
  const template = getItemTemplate(protocolId);
  if (!template) return null;

  const responses = parseItemProtocolResponses(
    template,
    parseResponsesJson(item.responses),
  );

  return {
    token: row.token,
    protocolId,
    protocolName: protocolName(protocolId),
    patientFirstName: firstName(row.patient.name),
    clinicName: row.organization.name.trim() || "Clínica",
    status: item.status === "submitted" ? "submitted" : "pending",
    responses,
    submittedAt: item.submittedAt?.toISOString() ?? null,
  };
}

export async function submitPublicInvite(input: SubmitPublicInviteInput) {
  const row = await protocolInviteRepository.findByToken(input.token);
  if (!row) return { ok: false as const, error: "Link inválido" };
  const flags = inviteFlags(row);
  if (!flags.isActive) {
    return { ok: false as const, error: "Este link expirou ou foi revogado" };
  }

  const item = row.items.find((i) => i.protocolId === input.protocolId);
  if (!item) return { ok: false as const, error: "Instrumento não encontrado" };
  if (item.status === "submitted") {
    return { ok: true as const, alreadySubmitted: true as const };
  }

  const template = getItemTemplate(input.protocolId);
  if (!template) {
    return { ok: false as const, error: "Instrumento inválido" };
  }

  const schema = createItemResponseSchema(template);
  const parsed = schema.safeParse(input.responses);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Responda todos os itens antes de enviar",
    };
  }

  const responses = parseItemProtocolResponses(template, input.responses);
  const date = new Date().toISOString().slice(0, 10);

  await protocolInviteRepository.submitItem({
    itemId: item.id,
    organizationId: row.organizationId,
    patientId: row.patientId,
    protocolId: input.protocolId,
    scores: JSON.stringify(responses),
    label: protocolName(input.protocolId),
    date,
  });

  return { ok: true as const, alreadySubmitted: false as const };
}

/** Lista instrumentos elegíveis para convite público. */
export function listPublicInviteProtocols() {
  return listEvaluationModules()
    .filter((mod) => mod.supportsPublicInvite && mod.template)
    .map((mod) => ({
      id: mod.id,
      name: mod.name,
      description: mod.description,
      professionId: mod.professionId,
    }));
}
