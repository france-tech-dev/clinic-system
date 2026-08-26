import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SESSION_NOTE_STATUS_LABEL } from "@/shared/constants/session-note-status";
import type { SessionNoteDTO } from "@/domains/patient/patient.types";
import { formatTime } from "@/shared/constants/appointment";
import { formatDateBR } from "@/shared/lib/format-date-br";

export function EvolucoesTab({
  sessionNotes,
  onNewSession,
  onViewSession,
}: {
  sessionNotes: SessionNoteDTO[];
  onNewSession: () => void;
  onViewSession: (note: SessionNoteDTO) => void;
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
      {sessionNotes.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-8 text-center">
          <p className="text-sm text-muted-foreground">
            Ainda não há evoluções neste paciente.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Registe a primeira após uma sessão na agenda.
          </p>
          <Button size="sm" className="mt-4" onClick={onNewSession}>
            <Plus className="size-4" />
            Nova evolução
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {sessionNotes.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onViewSession(s)}
                className="w-full rounded-md border border-border bg-card px-3 py-3 text-left hover:border-primary/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">
                    {SESSION_NOTE_STATUS_LABEL[s.status]}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
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
