import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EvaluationDTO } from "@/features/patient/patient.types";
import { formatDateBR } from "@/shared/lib/format-date-br";

export function AvaliacaoLista({
  evaluations,
  onNewEvaluation,
  onViewEvaluation,
}: {
  evaluations: EvaluationDTO[];
  onNewEvaluation: () => void;
  onViewEvaluation: (evaluation: EvaluationDTO) => void;
}) {
  return (
    <>
      <div className="no-print flex justify-end">
        <Button size="sm" onClick={onNewEvaluation}>
          <Plus className="size-4" />
          Nova avaliação
        </Button>
      </div>
      {evaluations.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma avaliação registrada. Use também os roteiros clínicos acima
          (SI, grafomotor, alimentação).
        </p>
      ) : (
        <ul className="space-y-2">
          {evaluations.map((ev) => (
            <li key={ev.id}>
              <button
                type="button"
                onClick={() => onViewEvaluation(ev)}
                className="w-full rounded-md border border-border bg-card px-3 py-3 text-left hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium capitalize">
                    Avaliação {ev.tipo}
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
                {ev.queixa && (
                  <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                    {ev.queixa}
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
