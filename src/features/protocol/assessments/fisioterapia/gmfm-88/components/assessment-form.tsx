"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/features/protocol/assessments/fisioterapia/gmfm-88/template";
import type { Gmfm88Scores } from "@/features/protocol/assessments/fisioterapia/gmfm-88/scoring";
import { summarizeGmfm88Domain } from "@/features/protocol/assessments/fisioterapia/gmfm-88/scoring";
import { cn } from "@/shared/lib/utils";

const SCORE_OPTIONS = [0, 1, 2, 3] as const;

export function GmfmAssessmentForm({
  label,
  onLabelChange,
  date,
  onDateChange,
  notes,
  onNotesChange,
  scores,
  onScoresChange,
}: {
  label: string;
  onLabelChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  scores: Gmfm88Scores;
  onScoresChange: (scores: Gmfm88Scores) => void;
}) {
  function setItemScore(itemId: string, value: number) {
    onScoresChange({ ...scores, [itemId]: value });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label htmlFor="gmfm-label">Tipo de avaliação</Label>
          <Select value={label} onValueChange={onLabelChange}>
            <SelectTrigger id="gmfm-label">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Avaliação">Avaliação</SelectItem>
              <SelectItem value="Reavaliação">Reavaliação</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="gmfm-date">Data</Label>
          <DatePicker
            id="gmfm-date"
            value={date}
            onChange={onDateChange}
          />
        </div>
      </div>

      <Accordion type="multiple" defaultValue={["A"]} className="w-full">
        {GMFM88_TEMPLATE.domains.map((domain) => {
          const summary = summarizeGmfm88Domain(scores, domain.id);
          return (
            <AccordionItem key={domain.id} value={domain.id}>
              <AccordionTrigger className="text-left">
                <span className="flex flex-1 items-center justify-between gap-2 pr-2">
                  <span>
                    {domain.id} — {domain.title}
                  </span>
                  {summary ? (
                    <span className="text-xs font-normal text-muted-foreground">
                      {summary.totalScore}/{summary.maxScore} (
                      {summary.percent.toFixed(1)}%)
                    </span>
                  ) : null}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-1">
                  {domain.items.map((item) => (
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
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <div className="grid gap-1.5">
        <Label htmlFor="gmfm-notes">Observações (opcional)</Label>
        <Textarea
          id="gmfm-notes"
          rows={2}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Notas clínicas sobre a aplicação do protocolo"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Pontuação por item: 0 = não inicia · {GMFM88_MAX_ITEM_SCORE} = completa
        (escala GMFM-88).
      </p>
    </div>
  );
}
