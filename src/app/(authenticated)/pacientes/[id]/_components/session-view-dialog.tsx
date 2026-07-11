"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SessionNoteDTO } from "@/features/patient/patient.types";
import { formatDateBR } from "@/shared/lib/format-date-br";

export function SessionViewDialog({
  note,
  onClose,
  onEdit,
  onDelete,
  pending,
}: {
  note: SessionNoteDTO | null;
  onClose: () => void;
  onEdit: (s: SessionNoteDTO) => void;
  onDelete: (id: string) => void;
  pending: boolean;
}) {
  if (!note) return null;
  return (
    <Dialog open={!!note} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif capitalize">
            {note.status} — {formatDateBR(note.date)}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Atividades:</strong>
          </p>
          <p className="whitespace-pre-line">{note.atividades || "—"}</p>
          <p>
            <strong>Observações:</strong>
          </p>
          <p className="whitespace-pre-line">{note.observacoes || "—"}</p>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={() => onDelete(note.id)}
          >
            Excluir
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button onClick={() => onEdit(note)}>Editar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
