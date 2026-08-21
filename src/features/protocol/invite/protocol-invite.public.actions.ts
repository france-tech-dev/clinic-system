"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { submitPublicInviteSchema } from "./protocol-invite.schema";
import { submitPublicInvite } from "./protocol-invite.service";

export async function submitPublicInviteAction(
  input: unknown,
): Promise<ActionResult<{ submitted: true; alreadySubmitted: boolean }>> {
  const parsed = submitPublicInviteSchema.safeParse(input);
  if (!parsed.success) return failZod(parsed.error);

  const result = await submitPublicInvite(parsed.data);
  if (!result.ok) return fail(result.error);

  revalidatePath(paths.avaliacaoPublica.byToken(parsed.data.token));
  revalidatePath(
    paths.avaliacaoPublica.byProtocol(
      parsed.data.token,
      parsed.data.protocolId,
    ),
  );
  return ok({
    submitted: true,
    alreadySubmitted: result.alreadySubmitted ?? false,
  });
}
