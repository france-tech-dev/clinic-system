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
import {
  AiGenerationLimitError,
  assertAiGenerationAllowed,
} from "@/shared/lib/ai/generation-limit";
import { OrgContextError } from "@/shared/lib/org-context";
import { buildProtocolInterpretationAIPrompt } from "@/domains/protocol/_lib/interpretationAI/prompt";
import { getProtocolInterpretationAIContext } from "@/domains/protocol/protocol.service";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  evaluationId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId, userId, billing } =
      await requireOrgFeatureWrite("ai");

    await assertAiGenerationAllowed({ organizationId, userId, billing });

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
    return Response.json(
      { error: "Não foi possível gerar a interpretação." },
      { status: 500 },
    );
  }
}
