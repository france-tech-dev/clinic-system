import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import { formatDateBR } from "@/shared/lib/date/format-date-br";

export function AvaliacaoLista({
  assessments,
  onNewEvaluation,
  onViewEvaluation,
}: {
  assessments: AssessmentDTO[];
  onNewEvaluation: () => void;
  onViewEvaluation: (evaluation: AssessmentDTO) => void;
}) {
  return (
    <>
      <div className="no-print flex justify-end">
        <Button size="sm" onClick={onNewEvaluation}>
          <Plus className="size-4" />
          Nova avaliação
        </Button>
      </div>
      {assessments.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ainda não há avaliações clínicas neste paciente.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece pela avaliação inicial do prontuário.
          </p>
          <Button size="sm" className="mt-4" onClick={onNewEvaluation}>
            <Plus className="size-4" />
            Nova avaliação
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {assessments.map((ev) => (
            <li key={ev.id}>
              <button
                type="button"
                onClick={() => onViewEvaluation(ev)}
                className="w-full rounded-md border border-border bg-card px-3 py-3 text-left hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium capitalize">
                    Avaliação {ev.type}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateBR(ev.date)}
                  </span>
                </div>
                {ev.professionalName ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {ev.professionalName}
                  </p>
                ) : null}
                {ev.complaint && (
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {ev.complaint}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
