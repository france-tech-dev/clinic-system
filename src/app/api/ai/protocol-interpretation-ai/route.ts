import { z } from "zod";
import { createTextStreamResponse, toTextStream } from "ai";
import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import {
  streamAiText,
  AiConfigError,
  textStreamWithTrailingError,
} from "@/shared/lib/ai";
import { logAiGeneration } from "@/shared/lib/ai/audit";
import { formatAiProviderError } from "@/shared/lib/ai/errors";
import { OrgContextError } from "@/shared/lib/org-context";
import { assertRateLimit } from "@/shared/lib/rate-limit";
import { buildProtocolInterpretationAIPrompt } from "@/domains/protocol/_lib/interpretationAI/prompt";
import { getProtocolInterpretationAIContext } from "@/domains/protocol/protocol.service";

export const runtime = "nodejs";
export const maxDuration = 60;

const AI_ORG_MAX_PER_HOUR = 40;
const AI_USER_MAX_PER_HOUR = 20;
const AI_WINDOW_SEC = 60 * 60;

const bodySchema = z.object({
  evaluationId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId, userId } = await requireOrgFeatureWrite("ai");

    const orgLimit = await assertRateLimit({
      key: `ai:org:${organizationId}`,
      windowSec: AI_WINDOW_SEC,
      max: AI_ORG_MAX_PER_HOUR,
    });
    if (!orgLimit.ok) {
      return Response.json(
        {
          error: `Limite de gerações da clínica atingido. Tente novamente em cerca de ${orgLimit.retryAfterSec}s.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(orgLimit.retryAfterSec) },
        },
      );
    }

    const userLimit = await assertRateLimit({
      key: `ai:user:${userId}`,
      windowSec: AI_WINDOW_SEC,
      max: AI_USER_MAX_PER_HOUR,
    });
    if (!userLimit.ok) {
      return Response.json(
        {
          error: `Limite de gerações da sua conta atingido. Tente novamente em cerca de ${userLimit.retryAfterSec}s.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(userLimit.retryAfterSec) },
        },
      );
    }

    const json: unknown = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return Response.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const ctx = await getProtocolInterpretationAIContext(
      organizationId,
      parsed.data.evaluationId,
    );
    if (!ctx) {
      return Response.json(
        { error: "Avaliação não encontrada" },
        { status: 404 },
      );
    }

    if (ctx.preview.sections.length === 0) {
      return Response.json(
        {
          error:
            "Instrumento sem secções tipadas para interpretação (ex.: GMFM).",
        },
        { status: 400 },
      );
    }

    await logAiGeneration({
      organizationId,
      userId,
      kind: "protocol-interpretation",
      evaluationId: parsed.data.evaluationId,
    });

    const prompt = buildProtocolInterpretationAIPrompt(
      ctx.preview,
      {
        patientFirstName: ctx.patientFirstName,
        patientAgeYears: ctx.patientAgeYears,
      },
      ctx.rawScoresText,
    );

    const result = streamAiText({
      system: prompt.system,
      prompt: prompt.user,
      abortSignal: req.signal,
    });

    return createTextStreamResponse({
      stream: textStreamWithTrailingError(
        toTextStream({ stream: result.stream }),
      ),
    });
  } catch (error) {
    if (error instanceof OrgContextError) {
      return Response.json({ error: error.message }, { status: 401 });
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
    return Response.json(
      { error: "Não foi possível gerar a interpretação." },
      { status: 500 },
    );
  }
}
