import { buildProtocolInterpretationAIPrompt } from "@/domains/protocol/_lib/interpretationAI/prompt";
import { getProtocolInterpretationAIContext } from "@/domains/protocol/protocol.service";
import { streamAiText } from "@/shared/lib/ai";
import { logAiGeneration } from "@/shared/lib/ai/audit";
import {
  prepareAiGeneration,
  toAiRouteErrorResponse,
  toAiStreamResponse,
} from "@/shared/lib/ai/route-handler";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  evaluationId: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { organizationId, userId } = await prepareAiGeneration();

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

    return toAiStreamResponse(result);
  } catch (error) {
    return toAiRouteErrorResponse(
      error,
      "Não foi possível gerar a interpretação.",
    );
  }
}
