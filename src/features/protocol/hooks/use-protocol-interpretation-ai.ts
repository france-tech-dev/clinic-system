"use client";

import { useEffect, useRef, useTransition } from "react";
import { useCompletion } from "@ai-sdk/react";
import { toast } from "sonner";
import { saveProtocolInterpretationAIAction } from "@/domains/protocol/protocol.actions";

const API_PATH = "/api/ai/protocol-interpretation-ai";

async function protocolInterpretationFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let message = "Não foi possível gerar a interpretação.";
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  return res;
}

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name === "AbortError" || /abort/i.test(error.message);
}

export function useProtocolInterpretationAI({
  evaluationId,
  initialInterpretationAI,
  canUseAi,
  onSaved,
}: {
  evaluationId: string;
  initialInterpretationAI: string | null;
  canUseAi: boolean;
  onSaved?: (interpretationAI: string | null) => void;
}) {
  const [isSaving, startSave] = useTransition();

  const { completion, setCompletion, complete, isLoading, stop } =
    useCompletion({
      api: API_PATH,
      id: evaluationId,
      streamProtocol: "text",
      body: { evaluationId },
      initialCompletion: initialInterpretationAI ?? "",
      fetch: protocolInterpretationFetch,
      onError: (error) => {
        if (isAbortError(error)) return;
        toast.error(error.message || "Falha ao gerar interpretação.");
      },
      onFinish: (_prompt, finalText) => {
        const marker = "[Erro na geração]";
        const idx = finalText.lastIndexOf(marker);
        if (idx === -1) return;
        const msg = finalText.slice(idx + marker.length).trim();
        toast.error(msg || "A geração falhou a meio do stream.");
      },
    });

  const stopRef = useRef(stop);

  useEffect(() => {
    stopRef.current = stop;
  }, [stop]);

  useEffect(() => {
    return () => {
      stopRef.current();
    };
  }, []);

  async function generate() {
    if (!canUseAi || isLoading) return;
    stop();
    setCompletion("");
    await complete("gerar", { body: { evaluationId } });
  }

  function save() {
    startSave(async () => {
      const result = await saveProtocolInterpretationAIAction({
        id: evaluationId,
        interpretationAI: completion.trim() || null,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      const saved = result.data.interpretationAI;
      setCompletion(saved ?? "");
      onSaved?.(saved);
      toast.success("Interpretação salva com sucesso");
    });
  }

  return {
    text: completion,
    setText: setCompletion,
    isGenerating: isLoading,
    isSaving,
    generate,
    stop,
    save,
  };
}
