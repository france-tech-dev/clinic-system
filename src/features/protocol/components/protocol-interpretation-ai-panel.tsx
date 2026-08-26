"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { saveProtocolInterpretationAIAction } from "@/features/protocol/protocol.actions";

async function readTextStream(
  response: Response,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (!response.body) {
    throw new Error("Resposta sem corpo");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  while (true) {
    if (signal?.aborted) {
      await reader.cancel();
      throw new DOMException("Aborted", "AbortError");
    }
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    full += chunk;
    onChunk(full);
  }
  full += decoder.decode();
  onChunk(full);
  return full;
}

export function ProtocolInterpretationAIPanel({
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
  const [text, setText] = useState(initialInterpretationAI ?? "");
  const [streaming, setStreaming] = useState(false);
  const [saving, startSave] = useTransition();
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  async function handleGenerate() {
    if (!canUseAi || streaming) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStreaming(true);
    setText("");

    try {
      const res = await fetch("/api/ai/protocol-interpretation-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evaluationId }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let message = "Não foi possível gerar a interpretação.";
        try {
          const body = (await res.json()) as { error?: string };
          if (body.error) message = body.error;
        } catch {
          /* ignore */
        }
        toast.error(message);
        return;
      }

      await readTextStream(res, setText, controller.signal);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Falha ao gerar interpretação.");
    } finally {
      setStreaming(false);
    }
  }

  function handleSave() {
    startSave(async () => {
      const result = await saveProtocolInterpretationAIAction({
        id: evaluationId,
        interpretationAI: text.trim() || null,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      const saved = result.data.interpretationAI;
      setText(saved ?? "");
      onSaved?.(saved);
      toast.success("Interpretação guardada");
    });
  }

  if (!canUseAi) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-4">
        <p className="text-sm font-medium">Interpretação assistida por IA</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Disponível no plano Enterprise (ou durante o período de teste).
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">Interpretação clínica</p>
          <p className="text-xs text-muted-foreground">
            Rascunho assistido por IA — rever antes de usar clinicamente. Não
            inventa T-scores; baseia-se nas respostas item a item.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={streaming || saving}
            onClick={() => void handleGenerate()}
          >
            {streaming ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Sparkles data-icon="inline-start" />
            )}
            {streaming ? "A gerar…" : text ? "Regenerar" : "Gerar"}
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={streaming || saving}
            onClick={handleSave}
          >
            {saving ? <Spinner data-icon="inline-start" /> : null}
            Guardar
          </Button>
        </div>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        readOnly={streaming}
        rows={12}
        className="min-h-48 resize-y font-mono text-xs leading-relaxed"
        placeholder={
          streaming
            ? "A escrever interpretação…"
            : "Gere um rascunho ou escreva a interpretação manualmente."
        }
        aria-label="Texto da interpretação clínica"
      />
    </div>
  );
}
