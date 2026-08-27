import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ClinicalEvaluationDTO } from "@/domains/patient/patient.types";
import { formatDateBR } from "@/shared/lib/format-date-br";

export function AvaliacaoLista({
  clinicalEvaluations,
  onNewEvaluation,
  onViewEvaluation,
}: {
  clinicalEvaluations: ClinicalEvaluationDTO[];
  onNewEvaluation: () => void;
  onViewEvaluation: (evaluation: ClinicalEvaluationDTO) => void;
}) {
  return (
    <>
      <div className="no-print flex justify-end">
        <Button size="sm" onClick={onNewEvaluation}>
          <Plus className="size-4" />
          Nova avaliação
        </Button>
      </div>
      {clinicalEvaluations.length === 0 ? (
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
          {clinicalEvaluations.map((ev) => (
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
                  <span className="font-mono text-xs text-muted-foreground">
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
