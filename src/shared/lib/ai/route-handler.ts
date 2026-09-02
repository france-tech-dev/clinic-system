import "server-only";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import type { BillingAccess } from "@/shared/constants/billing-plans";
import {
  AiConfigError,
  streamAiText,
  textStreamWithTrailingError,
} from "@/shared/lib/ai";
import { formatAiProviderError } from "@/shared/lib/ai/errors";
import {
  AiGenerationLimitError,
  assertAiGenerationAllowed,
} from "@/shared/lib/ai/generation-limit";
import { OrgContextError } from "@/shared/lib/org-context";
import { createTextStreamResponse, toTextStream } from "ai";

export type AiGenerationContext = {
  organizationId: string;
  userId: string;
  billing: BillingAccess;
};

/** Auth, billing (feature `ai`) e rate limit — partilhado por rotas `/api/ai/*`. */
export async function prepareAiGeneration(): Promise<AiGenerationContext> {
  await requirePermission({ project: ["read"] });
  const ctx = await requireOrgFeatureWrite("ai");
  await assertAiGenerationAllowed({
    organizationId: ctx.organizationId,
    userId: ctx.userId,
    billing: ctx.billing,
  });
  return ctx;
}

export function createAiTextStreamResponse(
  stream: ReadableStream<string>,
): Response {
  return createTextStreamResponse({
    stream: textStreamWithTrailingError(stream),
  });
}

export function toAiStreamResponse(
  result: ReturnType<typeof streamAiText>,
): Response {
  return createAiTextStreamResponse(toTextStream({ stream: result.stream }));
}

export function toAiRouteErrorResponse(
  error: unknown,
  fallbackMessage: string,
): Response {
  if (error instanceof OrgContextError) {
    return Response.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof AiGenerationLimitError) {
    return Response.json(
      { error: error.message },
      {
        status: 429,
        headers: error.retryAfterSec
          ? { "Retry-After": String(error.retryAfterSec) }
          : undefined,
      },
    );
  }
  if (error instanceof AiConfigError) {
    return Response.json({ error: error.message }, { status: 503 });
  }
  if (error instanceof Error) {
    const status =
      error.message === "Sem permissão."
        ? 403
        : error.message.includes("plano") ||
            error.message.includes("teste") ||
            error.message.includes("Assine")
          ? 402
          : 500;
    if (status !== 500) {
      return Response.json({ error: error.message }, { status });
    }
    return Response.json(
      { error: formatAiProviderError(error) },
      { status: 500 },
    );
  }
  console.error(error);
  return Response.json({ error: fallbackMessage }, { status: 500 });
}
