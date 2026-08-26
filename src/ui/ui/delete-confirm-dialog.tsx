"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

type DeleteConfirmDialogProps = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

function DeleteConfirmDialog({
  title = "Excluir?",
  description = "Esta ação não pode ser desfeita. O item será removido permanentemente.",
  confirmLabel = "Excluir",
  cancelLabel = "Cancelar",
  onConfirm,
  disabled = false,
  children,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row gap-2 sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline" disabled={disabled}>
              {cancelLabel}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              disabled={disabled}
              onClick={onConfirm}
            >
              {disabled ? <Spinner data-icon="inline-start" /> : null}
              {confirmLabel}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { DeleteConfirmDialog };
