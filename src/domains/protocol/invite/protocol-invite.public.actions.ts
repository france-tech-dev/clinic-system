"use server";

import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import { submitPublicInviteSchema } from "./protocol-invite.schema";
import { submitPublicInvite } from "./protocol-invite.service";

export async function submitPublicInviteAction(
  input: unknown,
): Promise<ActionResult<{ submitted: true; alreadySubmitted: boolean }>> {
  try {
    const payload = AppError.parse(submitPublicInviteSchema, input);

    const result = await submitPublicInvite(payload);
    if (!result.ok) throw new AppError(result.error);

    revalidatePath(paths.avaliacaoPublica.byToken(payload.token));
    revalidatePath(
      paths.avaliacaoPublica.byProtocol(payload.token, payload.protocolId),
    );
    return ok({
      submitted: true,
      alreadySubmitted: result.alreadySubmitted ?? false,
    });
  } catch (error) {
    return AppError.result(error);
  }
}
