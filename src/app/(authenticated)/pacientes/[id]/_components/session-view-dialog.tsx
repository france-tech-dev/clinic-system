"use client";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SessionNoteDTO } from "@/features/patient/patient.types";
import { formatTime } from "@/shared/constants/appointment";
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif capitalize">
            {note.status} — {formatDateBR(note.date)}
            {note.time ? ` às ${formatTime(note.time)}` : ""}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Atividades:</strong>
          </p>
          <p className="whitespace-pre-line">{note.activities || "—"}</p>
          <p>
            <strong>Observações:</strong>
          </p>
          <p className="whitespace-pre-line">{note.observations || "—"}</p>
        </div>
        <DialogFooter className="gap-2 sm:justify-between">
          <DeleteConfirmDialog
            onConfirm={() => onDelete(note.id)}
            disabled={pending}
          >
            <Button variant="destructive" size="sm" disabled={pending}>
              Excluir
            </Button>
          </DeleteConfirmDialog>
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
