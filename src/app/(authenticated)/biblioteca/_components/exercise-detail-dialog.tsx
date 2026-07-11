"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import { categoryOf } from "@/shared/constants/exercise-categories";
import { DetailField } from "./detail-field";

export function ExerciseDetailDialog({
  exercise,
  pending,
  onClose,
  onEdit,
  onRemove,
}: {
  exercise: ExerciseDTO | null;
  pending: boolean;
  onClose: () => void;
  onEdit: (exercise: ExerciseDTO) => void;
  onRemove: (exercise: ExerciseDTO) => void;
}) {
  return (
    <Dialog open={!!exercise} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {exercise && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">
                {exercise.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              <DetailField label="Categoria">
                {categoryOf(exercise.categoryId).label}
              </DetailField>
              <DetailField label="Objetivo">{exercise.objective}</DetailField>
              <DetailField label="Materiais">
                {exercise.materials || "—"}
              </DetailField>
              <DetailField label="Instruções">
                {exercise.instructions}
              </DetailField>
              <DetailField label="Duração">
                {exercise.duration || "—"}
              </DetailField>
              <DetailField label="Nível">{exercise.level}</DetailField>
            </div>
            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                variant="destructive"
                size="sm"
                disabled={pending}
                onClick={() => onRemove(exercise)}
              >
                <Trash2 className="size-4" />
                Remover
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                <Button onClick={() => onEdit(exercise)}>Editar</Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
