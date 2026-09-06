"use server";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  createProtocolInviteSchema,
  listProtocolInvitesSchema,
  protocolInviteIdSchema,
} from "./protocol-invite.schema";
import {
  createProtocolInvite,
  deleteProtocolInvite,
  listProtocolInvites,
  revokeProtocolInvite,
} from "./protocol-invite.service";
import type { ProtocolInviteDTO } from "./protocol-invite.types";

async function requestOrigin(): Promise<string | undefined> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (!host) return undefined;
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

export async function createProtocolInviteAction(
  input: unknown,
): Promise<ActionResult<ProtocolInviteDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(createProtocolInviteSchema, input);

    const { organizationId, userId } =
      await requireOrgFeatureWrite("avaliacoes");
    const origin = await requestOrigin();
    const data = await createProtocolInvite(
      organizationId,
      userId,
      payload,
      origin,
    );
    if (!data) throw new AppError("Paciente não encontrado");

    revalidatePath(paths.paciente(payload.patientId));
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function listProtocolInvitesAction(
  input: unknown,
): Promise<ActionResult<ProtocolInviteDTO[]>> {
  try {
    await requirePermission({ project: ["read"] });
    const payload = AppError.parse(listProtocolInvitesSchema, input);

    const { organizationId } = await requireOrgId();
    const origin = await requestOrigin();
    const data = await listProtocolInvites(
      organizationId,
      payload.patientId,
      origin,
    );
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function revokeProtocolInviteAction(
  input: unknown,
): Promise<ActionResult<ProtocolInviteDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(protocolInviteIdSchema, input);

    const { organizationId } = await requireOrgFeatureWrite("avaliacoes");
    const origin = await requestOrigin();
    const data = await revokeProtocolInvite(organizationId, payload.id, origin);
    if (!data) throw new AppError("Convite não encontrado");

    revalidatePath(paths.paciente(data.patientId));
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteProtocolInviteAction(
  input: unknown,
): Promise<ActionResult<ProtocolInviteDTO>> {
  try {
    await requirePermission({ project: ["delete"] });
    const payload = AppError.parse(protocolInviteIdSchema, input);

    const { organizationId } = await requireOrgFeatureWrite("avaliacoes");
    const origin = await requestOrigin();
    const data = await deleteProtocolInvite(organizationId, payload.id, origin);
    if (!data) throw new AppError("Convite não encontrado");

    revalidatePath(paths.paciente(data.patientId));
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}
