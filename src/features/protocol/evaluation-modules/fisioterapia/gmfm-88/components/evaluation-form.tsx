"use client";

import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ClinicalWorkspaceShell } from "@/components/clinical-workspace-shell";
import { DatePicker } from "@/components/ui/date-picker";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  GMFM88_TEMPLATE,
  GMFM88_MAX_ITEM_SCORE,
} from "@/features/protocol/evaluation-modules/fisioterapia/gmfm-88/template";
import type { Gmfm88Scores } from "@/features/protocol/evaluation-modules/fisioterapia/gmfm-88/scoring";
import { summarizeGmfm88Domain } from "@/features/protocol/evaluation-modules/fisioterapia/gmfm-88/scoring";
import type { ProtocolEvaluationFormInput } from "@/features/protocol/protocol.schema";
import { cn } from "@/shared/lib/utils";

const SCORE_OPTIONS = [0, 1, 2, 3] as const;

export type GmfmEvaluationFormValues = ProtocolEvaluationFormInput & {
  id?: string;
};

export function GmfmEvaluationForm() {
  const { control, setValue } = useFormContext<GmfmEvaluationFormValues>();
  const scores =
    (useWatch({ control, name: "scores" }) as Gmfm88Scores | undefined) ?? {};
  const [activeDomainId, setActiveDomainId] = useState(
    GMFM88_TEMPLATE.domains[0]?.id ?? "A",
  );

  const activeDomain =
    GMFM88_TEMPLATE.domains.find((d) => d.id === activeDomainId) ??
    GMFM88_TEMPLATE.domains[0];
  const activeSummary = activeDomain
    ? summarizeGmfm88Domain(scores, activeDomain.id)
    : null;

  function setItemScore(itemId: string, value: number) {
    setValue(`scores.${itemId}` as `scores.${string}`, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid items-start gap-3 sm:grid-cols-2">
        <FormField
          control={control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de avaliação *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger id="gmfm-label">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Avaliação">Avaliação</SelectItem>
                  <SelectItem value="Reavaliação">Reavaliação</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data *</FormLabel>
              <FormControl>
                <DatePicker
                  id="gmfm-date"
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {activeDomain ? (
        <ClinicalWorkspaceShell
          navLabel="Domínios GMFM-88"
          items={GMFM88_TEMPLATE.domains.map((domain) => {
            const summary = summarizeGmfm88Domain(scores, domain.id);
            return {
              id: domain.id,
              label: `${domain.id} — ${domain.title}`,
              meta: summary
                ? `${summary.totalScore}/${summary.maxScore}`
                : undefined,
            };
          })}
          activeId={activeDomain.id}
          onSelect={setActiveDomainId}
        >
          <div>
            <h3 className="font-serif text-lg font-semibold">
              {activeDomain.id} — {activeDomain.title}
            </h3>
            {activeSummary ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {activeSummary.totalScore}/{activeSummary.maxScore} (
                {activeSummary.percent.toFixed(1)}%)
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            {activeDomain.items.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-border p-3"
              >
                <p className="mb-2 text-sm leading-snug">{item.label}</p>
                <div className="flex gap-1">
                  {SCORE_OPTIONS.map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setItemScore(item.id, score)}
                      className={cn(
                        "size-8 rounded border text-xs font-medium",
                        scores[item.id] === score
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ClinicalWorkspaceShell>
      ) : null}

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações (opcional)</FormLabel>
            <FormControl>
              <Textarea
                id="gmfm-notes"
                rows={2}
                placeholder="Notas clínicas sobre a aplicação do protocolo"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <p className="text-xs text-muted-foreground">
        Pontuação por item: 0 = não inicia · {GMFM88_MAX_ITEM_SCORE} = completa
        (escala GMFM-88).
      </p>
    </div>
  );
}
