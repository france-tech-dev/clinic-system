import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVOLUTION_STATUS_LABEL } from "@/shared/constants/evolution-status";
import type { EvolutionDTO } from "@/domains/evolution/evolution.types";
import { formatTime } from "@/shared/constants/appointment";
import { formatDateBR } from "@/shared/lib/date/format-date-br";

export function EvolucoesTab({
  evolutions,
  onNewSession,
  onViewSession,
}: {
  evolutions: EvolutionDTO[];
  onNewSession: () => void;
  onViewSession: (note: EvolutionDTO) => void;
}) {
  return (
    <section
      role="tabpanel"
      id="patient-tabpanel-evolucoes"
      aria-labelledby="patient-tab-evolucoes"
      className="space-y-3"
    >
      <div className="no-print flex justify-end">
        <Button size="sm" onClick={onNewSession}>
          <Plus className="size-4" />
          Nova evolução
        </Button>
      </div>
      {evolutions.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ainda não há evoluções neste paciente.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Registre a primeira após uma sessão na agenda.
          </p>
          <Button size="sm" className="mt-4" onClick={onNewSession}>
            <Plus className="size-4" />
            Nova evolução
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {evolutions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onViewSession(s)}
                className="w-full rounded-md border border-border bg-card px-3 py-3 text-left hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {EVOLUTION_STATUS_LABEL[s.status]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDateBR(s.date)}
                    {s.time ? ` · ${formatTime(s.time)}` : ""}
                  </span>
                </div>
                {s.professionalName ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.professionalName}
                  </p>
                ) : null}
                {s.activities && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {s.activities}
                  </p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
