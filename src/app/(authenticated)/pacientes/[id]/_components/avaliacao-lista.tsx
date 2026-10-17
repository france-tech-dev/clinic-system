import Link from "next/link";
import { ClipboardList, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import { paths } from "@/shared/constants/paths";
import { formatDateBR } from "@/shared/lib/date/format-date-br";

export function AvaliacaoLista({
  patientId,
  assessments,
  onViewEvaluation,
  onNewFicha,
}: {
  patientId: string;
  assessments: AssessmentDTO[];
  onViewEvaluation: (evaluation: AssessmentDTO) => void;
  onNewFicha: () => void;
}) {
  const hubHref = `${paths.avaliacoes.root}?paciente=${patientId}`;

  return (
    <>
      <div className="no-print flex flex-wrap justify-end gap-2">
        <Button asChild size="sm" variant="outline">
          <Link href={hubHref}>
            <ClipboardList className="size-4" />
            Instrumentos
          </Link>
        </Button>
        <Button size="sm" onClick={onNewFicha}>
          <Plus className="size-4" />
          Nova ficha
        </Button>
      </div>
      {assessments.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ainda não há fichas clínicas neste paciente.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie uma ficha de avaliação TO ou use um instrumento em Avaliações.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={onNewFicha}>
              <Plus className="size-4" />
              Nova ficha
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={hubHref}>
                <ClipboardList className="size-4" />
                Instrumentos
              </Link>
            </Button>
          </div>
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
                    Ficha {ev.type}
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
