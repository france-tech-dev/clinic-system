"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  publicInviteInstrumentSchema,
  publicInviteTokenSchema,
  savePublicInviteDraftSchema,
  submitPublicInviteSchema,
} from "./protocol-invite.schema";
import {
  getPublicProtocolInvite,
  getPublicProtocolInviteInstrument,
  savePublicInviteDraft,
  submitPublicInvite,
} from "./protocol-invite.service";
import type {
  PublicProtocolInviteDTO,
  PublicProtocolInviteInstrumentDTO,
} from "./protocol-invite.types";

export async function getPublicProtocolInviteAction(
  input: unknown,
): Promise<ActionResult<PublicProtocolInviteDTO>> {
  const parsed = publicInviteTokenSchema.safeParse(input);
  if (!parsed.success) return fail("Link inválido");

  const data = await getPublicProtocolInvite(parsed.data.token);
  if (!data) return fail("Este link é inválido, expirou ou foi revogado");
  return ok(data);
}

export async function getPublicProtocolInviteInstrumentAction(
  input: unknown,
): Promise<ActionResult<PublicProtocolInviteInstrumentDTO>> {
  const parsed = publicInviteInstrumentSchema.safeParse(input);
  if (!parsed.success) return fail("Link inválido");

  const data = await getPublicProtocolInviteInstrument(
    parsed.data.token,
    parsed.data.protocolId,
  );
  if (!data) return fail("Este link é inválido, expirou ou foi revogado");
  return ok(data);
}

export async function savePublicInviteDraftAction(
  input: unknown,
): Promise<ActionResult<{ saved: true }>> {
  const parsed = savePublicInviteDraftSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const result = await savePublicInviteDraft(parsed.data);
  if (!result.ok) return fail(result.error);

  revalidatePath(paths.avaliacaoPublica.byProtocol(parsed.data.token, parsed.data.protocolId));
  return ok({ saved: true });
}

export async function submitPublicInviteAction(
  input: unknown,
): Promise<ActionResult<{ submitted: true; alreadySubmitted: boolean }>> {
  const parsed = submitPublicInviteSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const result = await submitPublicInvite(parsed.data);
  if (!result.ok) return fail(result.error);

  revalidatePath(paths.avaliacaoPublica.byToken(parsed.data.token));
  revalidatePath(
    paths.avaliacaoPublica.byProtocol(parsed.data.token, parsed.data.protocolId),
  );
  return ok({
    submitted: true,
    alreadySubmitted: result.alreadySubmitted ?? false,
  });
}
