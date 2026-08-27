"use client";

import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { ProtocolEvaluationPreviewDTO } from "@/domains/protocol/protocol.types";
import type { ProtocolInviteItemDTO } from "@/domains/protocol/invite/protocol-invite.types";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { ProtocolInterpretationAIPanel } from "./protocol-interpretation-ai-panel";

export function ProtocolInviteResultsDialog({
  open,
  onOpenChange,
  items,
  activeEvaluationId,
  onSelectEvaluationId,
  preview,
  loading,
  canUseAi,
  onInterpretationAISaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ProtocolInviteItemDTO[];
  activeEvaluationId: string | null;
  onSelectEvaluationId: (evaluationId: string) => void;
  preview: ProtocolEvaluationPreviewDTO | null;
  loading: boolean;
  canUseAi: boolean;
  onInterpretationAISaved?: (
    evaluationId: string,
    interpretationAI: string | null,
  ) => void;
}) {
  const submitted = items.filter(
    (item) => item.status === "submitted" && item.evaluationId != null,
  );
  const activeItem =
    submitted.find((item) => item.evaluationId === activeEvaluationId) ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,100%)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
          <DialogTitle className="font-serif">
            Respostas do responsável
          </DialogTitle>
          <DialogDescription className="text-pretty">
            <span className="sm:hidden">Pré-visualização das respostas.</span>
            <span className="hidden sm:inline">
              Pré-visualização das avaliações preenchidas. Gráficos por
              instrumento entram numa próxima etapa.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
          {submitted.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não há instrumentos respondidos neste link.
            </p>
          ) : (
            <>
              {submitted.length > 1 ? (
                <NativeSelect
                  className="w-full"
                  value={activeEvaluationId ?? ""}
                  onChange={(e) => onSelectEvaluationId(e.target.value)}
                  aria-label="Instrumento respondido"
                >
                  {submitted.map((item) => (
                    <NativeSelectOption
                      key={item.id}
                      value={item.evaluationId!}
                    >
                      {item.protocolName}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              ) : (
                <p className="text-sm font-medium">
                  {preview?.protocolName ?? activeItem?.protocolName}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {preview ? (
                  <span>Data {formatDateBR(preview.date)}</span>
                ) : null}
                {activeItem?.submittedAt ? (
                  <Badge variant="secondary">Respondido</Badge>
                ) : null}
              </div>

              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center">
                <BarChart3
                  className="size-8 text-muted-foreground"
                  aria-hidden
                />
                <p className="text-sm font-medium">Resumo gráfico</p>
                <p className="max-w-xs text-xs text-muted-foreground">
                  Em breve: gráfico de cada avaliação neste diálogo.
                </p>
              </div>

              {preview && activeEvaluationId && preview.sections.length > 0 ? (
                <ProtocolInterpretationAIPanel
                  key={activeEvaluationId}
                  evaluationId={activeEvaluationId}
                  initialInterpretationAI={preview.interpretationAI}
                  canUseAi={canUseAi}
                  onSaved={(interpretationAI) =>
                    onInterpretationAISaved?.(activeEvaluationId, interpretationAI)
                  }
                />
              ) : null}

              {loading && !preview ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : null}

              {preview && preview.sections.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {preview.sections.map((section) => (
                    <section
                      key={section.id}
                      className="overflow-hidden rounded-xl border border-border"
                    >
                      <div className="bg-muted/60 px-3 py-2">
                        <h3 className="text-xs font-semibold tracking-wide uppercase">
                          {section.title}
                        </h3>
                      </div>
                      <ul className="divide-y divide-border">
                        {section.items.map((item, index) => (
                          <li
                            key={item.id}
                            className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3"
                          >
                            <p className="min-w-0 flex-1 text-sm leading-snug">
                              <span className="mr-1.5 text-muted-foreground tabular-nums">
                                {index + 1}.
                              </span>
                              {item.label}
                            </p>
                            <span className="shrink-0 text-xs font-medium sm:pt-0.5">
                              {item.valueLabel}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : null}

              {preview && preview.sections.length === 0 && !loading ? (
                <p className="text-sm text-muted-foreground">
                  Modelo do instrumento não encontrado para pré-visualização.
                </p>
              ) : null}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
