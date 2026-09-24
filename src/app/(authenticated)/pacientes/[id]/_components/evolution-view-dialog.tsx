"use client";

import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogScrollBody,
  DialogTitle,
  dialogScrollableClassName,
  dialogScrollFooterClassName,
  dialogScrollHeaderClassName,
} from "@/components/ui/dialog";
import { EVOLUTION_STATUS_LABEL } from "@/shared/constants/evolution-status";
import type { EvolutionDTO } from "@/domains/evolution/evolution.types";
import { formatTime } from "@/shared/constants/appointment";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import { cn } from "@/shared/lib/utils";

export function EvolutionViewDialog({
  note,
  onClose,
  onEdit,
  onDelete,
  pending,
}: {
  note: EvolutionDTO | null;
  onClose: () => void;
  onEdit: (s: EvolutionDTO) => void;
  onDelete: (id: string) => void;
  pending: boolean;
}) {
  if (!note) return null;
  return (
    <Dialog open={!!note} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className={cn(dialogScrollableClassName, "sm:max-w-2xl")}
      >
        <DialogHeader className={dialogScrollHeaderClassName}>
          <DialogTitle>
            {EVOLUTION_STATUS_LABEL[note.status]} — {formatDateBR(note.date)}
            {note.time ? ` às ${formatTime(note.time)}` : ""}
          </DialogTitle>
        </DialogHeader>
        <DialogScrollBody className="flex flex-col gap-2 text-sm">
          <p>
            <strong>Atividades:</strong>
          </p>
          <p className="whitespace-pre-line">{note.activities || "—"}</p>
          <p>
            <strong>Observações:</strong>
          </p>
          <p className="whitespace-pre-line">{note.observations || "—"}</p>
        </DialogScrollBody>
        <DialogFooter
          className={cn(dialogScrollFooterClassName, "gap-2 sm:justify-between")}
        >
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
