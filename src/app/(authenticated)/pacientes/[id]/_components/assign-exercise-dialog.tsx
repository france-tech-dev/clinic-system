"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import { EXERCISE_CATEGORIES } from "@/shared/constants/exercise-categories";
import { cn } from "@/shared/lib/utils";

export function AssignExerciseDialog({
  open,
  onOpenChange,
  patientName,
  assignSearch,
  onAssignSearchChange,
  assignCat,
  onAssignCatChange,
  assignList,
  assignedIds,
  pending,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientName: string;
  assignSearch: string;
  onAssignSearchChange: (value: string) => void;
  assignCat: string | null;
  onAssignCatChange: (categoryId: string | null) => void;
  assignList: ExerciseDTO[];
  assignedIds: Set<string>;
  pending: boolean;
  onAssign: (exerciseId: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">
            Atribuir a {patientName}
          </DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Buscar…"
          value={assignSearch}
          onChange={(e) => onAssignSearchChange(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            className={cn(
              "rounded-full border px-2 py-0.5 text-xs",
              !assignCat && "border-primary bg-primary/10",
            )}
            onClick={() => onAssignCatChange(null)}
          >
            Todas
          </button>
          {EXERCISE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              className={cn(
                "rounded-full border px-2 py-0.5 text-xs",
                assignCat === c.id && "border-primary bg-primary/10",
              )}
              onClick={() => onAssignCatChange(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {assignList.map((ex) => {
            const already = assignedIds.has(ex.id);
            return (
              <li
                key={ex.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-2 py-2 text-sm"
              >
                <span className="truncate">{ex.title}</span>
                <Button
                  size="sm"
                  variant={already ? "outline" : "default"}
                  disabled={already || pending}
                  onClick={() => onAssign(ex.id)}
                >
                  {already ? "No plano" : "Atribuir"}
                </Button>
              </li>
            );
          })}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
