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
import type { ProtocolAssessmentPreviewDTO } from "@/domains/protocol/protocol.types";
import type { ProtocolInviteItemDTO } from "@/domains/protocol/invite/protocol-invite.types";
import { ITEM_SCALE_OPTIONS } from "@/domains/protocol/instruments/_shared/item-scale";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import { cn } from "@/shared/lib/utils";
import { ProtocolInterpretationAIPanel } from "./protocol-interpretation-ai-panel";

function previewItemNumbers(
  sections: ProtocolAssessmentPreviewDTO["sections"],
): Map<string, number> {
  const map = new Map<string, number>();
  let n = 0;
  for (const section of sections) {
    for (const item of section.items) {
      n += 1;
      map.set(item.id, n);
    }
  }
  return map;
}

export function ProtocolInviteResultsDialog({
  open,
  onOpenChange,
  items,
  activeAssessmentId,
  onSelectAssessmentId,
  preview,
  loading,
  canUseAi,
  onInterpretationAISaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ProtocolInviteItemDTO[];
  activeAssessmentId: string | null;
  onSelectAssessmentId: (assessmentId: string) => void;
  preview: ProtocolAssessmentPreviewDTO | null;
  loading: boolean;
  canUseAi: boolean;
  onInterpretationAISaved?: (
    assessmentId: string,
    interpretationAI: string | null,
  ) => void;
}) {
  const submitted = items.filter(
    (item) => item.status === "submitted" && item.assessmentId != null,
  );
  const activeItem =
    submitted.find((item) => item.assessmentId === activeAssessmentId) ?? null;

  const scaleOptions =
    preview?.scale != null ? ITEM_SCALE_OPTIONS[preview.scale] : null;
  const itemNumbers = preview
    ? previewItemNumbers(preview.sections)
    : new Map<string, number>();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92dvh,100%)] w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-4 py-4 sm:px-6">
          <DialogTitle>
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
                  value={activeAssessmentId ?? ""}
                  onChange={(e) => onSelectAssessmentId(e.target.value)}
                  aria-label="Instrumento respondido"
                >
                  {submitted.map((item) => (
                    <NativeSelectOption
                      key={item.id}
                      value={item.assessmentId!}
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

              {preview && activeAssessmentId && preview.sections.length > 0 ? (
                <ProtocolInterpretationAIPanel
                  key={activeAssessmentId}
                  evaluationId={activeAssessmentId}
                  initialInterpretationAI={preview.interpretationAI}
                  canUseAi={canUseAi}
                  onSaved={(interpretationAI) =>
                    onInterpretationAISaved?.(activeAssessmentId, interpretationAI)
                  }
                />
              ) : null}

              {loading && !preview ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : null}

              {preview && preview.sections.length > 0 && scaleOptions ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-border bg-amber-500/10 px-4 py-3 text-sm text-amber-950 shadow-sm dark:bg-amber-400/10 dark:text-amber-100 sm:px-5">
                    {scaleOptions.map((opt) => (
                      <span
                        key={String(opt.value)}
                        className="inline-flex items-center gap-1.5"
                      >
                        <span className="flex size-6 items-center justify-center rounded-full border border-amber-900/20 bg-card text-xs font-semibold dark:border-amber-100/20">
                          {String(opt.value)}
                        </span>
                        {opt.label}
                      </span>
                    ))}
                  </div>

                  {preview.sections.map((section) => (
                    <section
                      key={section.id}
                      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                    >
                      <div className="bg-muted/60 px-4 py-3 sm:px-5">
                        <h3 className="text-sm font-semibold tracking-tight uppercase">
                          {section.id.toUpperCase()}: {section.title}
                        </h3>
                      </div>
                      <ul className="divide-y divide-border">
                        {section.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5"
                          >
                            <p className="min-w-0 flex-1 text-sm leading-snug">
                              <span className="mr-1.5 font-medium text-muted-foreground tabular-nums">
                                {itemNumbers.get(item.id)}.
                              </span>
                              {item.label}
                            </p>
                            <div
                              className="flex shrink-0 flex-wrap gap-2"
                              role="group"
                              aria-label={`${item.label}: ${item.valueLabel}`}
                            >
                              {scaleOptions.map((opt) => {
                                const selected =
                                  item.value != null &&
                                  item.value === String(opt.value);
                                return (
                                  <span
                                    key={String(opt.value)}
                                    title={opt.label}
                                    aria-current={selected ? "true" : undefined}
                                    className={cn(
                                      "flex size-9 items-center justify-center rounded-full border text-sm font-semibold",
                                      selected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card text-muted-foreground opacity-80",
                                    )}
                                  >
                                    {String(opt.value)}
                                  </span>
                                );
                              })}
                            </div>
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
