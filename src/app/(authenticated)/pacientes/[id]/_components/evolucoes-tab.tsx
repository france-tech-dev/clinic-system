import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SessionNoteDTO } from "@/features/patient/patient.types";
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
    <section className="space-y-3">
      <div className="no-print flex justify-end">
        <Button size="sm" onClick={onNewSession}>
          <Plus className="size-4" />
          Nova evolução
        </Button>
      </div>
      {sessionNotes.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma evolução registrada.
        </p>
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
                  <span className="font-medium capitalize">{s.status}</span>
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
