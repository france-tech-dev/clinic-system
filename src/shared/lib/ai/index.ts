import "server-only";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { env } from "@/shared/env";

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
    const google = createGoogleGenerativeAI({
      apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    return google(model);
  }

  const openai = createOpenAI({
    apiKey: env.OPENAI_API_KEY,
  });
  return openai(model);
}

export type StreamTextParams = {
  system: string;
  prompt: string;
  abortSignal?: AbortSignal;
};

/** Stream de texto partilhável entre domínios (protocolo, anamnese, …). */
export function streamAiText(params: StreamTextParams) {
  return streamText({
    model: getAiModel(),
    system: params.system,
    prompt: params.prompt,
    abortSignal: params.abortSignal,
  });
}
