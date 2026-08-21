"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { paths } from "@/shared/constants/paths";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  createProtocolInviteSchema,
  listProtocolInvitesSchema,
  protocolInviteIdSchema,
} from "./protocol-invite.schema";
import {
  createProtocolInvite,
  listProtocolInvites,
  revokeProtocolInvite,
} from "./protocol-invite.service";
import type { ProtocolInviteDTO } from "./protocol-invite.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

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
    const parsed = createProtocolInviteSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);

    const { organizationId, userId } =
      await requireOrgFeatureWrite("avaliacoes");
    const origin = await requestOrigin();
    const data = await createProtocolInvite(
      organizationId,
      userId,
      parsed.data,
      origin,
    );
    if (!data) return fail("Paciente não encontrado");

    revalidatePath(paths.paciente(parsed.data.patientId));
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function listProtocolInvitesAction(
  input: unknown,
): Promise<ActionResult<ProtocolInviteDTO[]>> {
  try {
    await requirePermission({ project: ["read"] });
    const parsed = listProtocolInvitesSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgId();
    const origin = await requestOrigin();
    const data = await listProtocolInvites(
      organizationId,
      parsed.data.patientId,
      origin,
    );
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function revokeProtocolInviteAction(
  input: unknown,
): Promise<ActionResult<ProtocolInviteDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = protocolInviteIdSchema.safeParse(input);
    if (!parsed.success) return fail("Dados inválidos");

    const { organizationId } = await requireOrgFeatureWrite("avaliacoes");
    const origin = await requestOrigin();
    const data = await revokeProtocolInvite(
      organizationId,
      parsed.data.id,
      origin,
    );
    if (!data) return fail("Convite não encontrado");

    revalidatePath(paths.paciente(data.patientId));
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
