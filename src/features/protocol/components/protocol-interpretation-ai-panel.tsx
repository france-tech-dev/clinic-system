"use client";

import { Square, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { formatTrialAiQuotaHint } from "@/shared/lib/ai/_lib/quota";
import { useAiTrialQuota } from "@/features/protocol/components/ai-trial-quota-provider";
import { useProtocolInterpretationAI } from "@/features/protocol/hooks/use-protocol-interpretation-ai";

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
  const { quota, consumeGeneration } = useAiTrialQuota();

  const {
    text,
    setText,
    isGenerating,
    isSaving,
    generate,
    stop,
    save,
  } = useProtocolInterpretationAI({
    evaluationId,
    initialInterpretationAI,
    canUseAi: canUseAi && (quota?.canGenerate ?? true),
    onSaved,
    onGenerationStarted: consumeGeneration,
  });

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

  const trialQuotaHint = quota ? formatTrialAiQuotaHint(quota) : null;
  const generateDisabled = isSaving || (quota != null && !quota.canGenerate);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border p-3 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium">Interpretação clínica</p>
          <p className="text-xs text-muted-foreground">
            Interpretação por IA — rever antes de usar clinicamente. A IA não
            inventa T-scores; usa respostas item a item e somas brutas.
          </p>
          {trialQuotaHint ? (
            <p className="text-xs text-muted-foreground">{trialQuotaHint}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {isGenerating ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => stop()}
            >
              <Square data-icon="inline-start" className="size-3.5 fill-current" />
              Parar
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={generateDisabled}
              onClick={() => void generate()}
            >
              <Sparkles data-icon="inline-start" />
              {text ? "Regenerar" : "Gerar"}
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            disabled={isGenerating || isSaving}
            onClick={save}
          >
            {isSaving ? <Spinner data-icon="inline-start" /> : null}
            Salvar
          </Button>
        </div>
      </div>

      {quota && !quota.canGenerate ? (
        <p className="text-xs text-muted-foreground">
          Limite do período de teste atingido. Assine o plano Enterprise para
          continuar a gerar interpretações.
        </p>
      ) : null}

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        readOnly={isGenerating}
        rows={12}
        className="min-h-48 resize-y font-mono text-xs leading-relaxed"
        placeholder={
          isGenerating
            ? "A escrever interpretação…"
            : "Gere um rascunho ou escreva a interpretação manualmente."
        }
        aria-label="Texto da interpretação clínica"
      />
    </div>
  );
}
