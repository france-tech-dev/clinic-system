import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { env } from "@/shared/env";
import { formatAiProviderError } from "@/shared/lib/ai/errors";

export class AiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiConfigError";
  }
}

const DEFAULT_MODEL = {
  openai: "gpt-5-mini",
  google: "gemini-2.5-flash",
} as const;

export function getAiModel() {
  const provider = env.AI_PROVIDER;
  const model = env.AI_MODEL || DEFAULT_MODEL[provider];

  if (provider === "google") {
    if (!env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new AiConfigError(
        "GOOGLE_GENERATIVE_AI_API_KEY não configurada. Defina a variável de ambiente para usar Gemini.",
      );
    }
    const google = createGoogleGenerativeAI({
      apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    return google(model);
  }

  if (!env.OPENAI_API_KEY) {
    throw new AiConfigError(
      "OPENAI_API_KEY não configurada. Defina a variável de ambiente para usar OpenAI.",
    );
  }
  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
  return openai(model);
}

export type StreamTextParams = {
  system: string;
  prompt: string;
  abortSignal?: AbortSignal;
};

export function streamAiText(params: StreamTextParams) {
  return streamText({
    model: getAiModel(),
    system: params.system,
    prompt: params.prompt,
    abortSignal: params.abortSignal,
    // Evita 3× cobrança em erros de quota marcados como retryable.
    maxRetries: 1,
    onError: ({ error }) => {
      console.error("[ai]", formatAiProviderError(error), error);
    },
  });
}

export function textStreamWithTrailingError(
  stream: ReadableStream<string>,
): ReadableStream<string> {
  const reader = stream.getReader();
  return new ReadableStream<string>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          controller.close();
          return;
        }
        controller.enqueue(
          `\n\n[Erro na geração] ${formatAiProviderError(error)}`,
        );
        controller.close();
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    },
  });
}
