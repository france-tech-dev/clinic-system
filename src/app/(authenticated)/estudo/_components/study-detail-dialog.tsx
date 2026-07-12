"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { StudyCardDTO } from "@/features/study/study.types";
import { studyCategoryOf } from "@/shared/constants/study-categories";

export function StudyDetailDialog({
  card,
  pending,
  onClose,
  onEdit,
  onRemove,
}: {
  card: StudyCardDTO | null;
  pending: boolean;
  onClose: () => void;
  onEdit: (card: StudyCardDTO) => void;
  onRemove: (card: StudyCardDTO) => void;
}) {
  return (
    <Dialog open={!!card} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {card && (
          <>
            <DialogHeader>
              <span
                className="mb-1 inline-flex w-fit rounded px-2 py-0.5 text-[0.625rem] font-medium text-white"
                style={{
                  background: studyCategoryOf(card.categoryId).color,
                }}
              >
                {studyCategoryOf(card.categoryId).label}
              </span>
              <DialogTitle className="font-serif text-xl">
                {card.title}
              </DialogTitle>
              {card.isCustom && (
                <p className="font-mono text-xs tracking-wide text-primary">
                  NOTA PESSOAL
                </p>
              )}
            </DialogHeader>
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {card.content}
            </p>
            <DialogFooter className="gap-2 sm:justify-between">
              <DeleteConfirmDialog
                title="Excluir nota?"
                description="Esta ação não pode ser desfeita. A nota de estudo será removida permanentemente."
                onConfirm={() => onRemove(card)}
                disabled={pending}
              >
                <Button variant="destructive" disabled={pending}>
                  <Trash2 className="size-4" />
                  Excluir
                </Button>
              </DeleteConfirmDialog>
              <Button onClick={() => onEdit(card)}>Editar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
