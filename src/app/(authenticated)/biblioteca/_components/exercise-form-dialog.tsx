"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import {
  EXERCISE_CATEGORIES,
  EXERCISE_LEVELS,
} from "@/shared/constants/exercise-categories";
import type { ExerciseFormState } from "./exercise-form-types";

export function ExerciseFormDialog({
  open,
  onOpenChange,
  editing,
  form,
  onFormChange,
  pending,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: ExerciseDTO | null;
  form: ExerciseFormState;
  onFormChange: (form: ExerciseFormState) => void;
  pending: boolean;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {editing ? "Editar atividade" : "Nova atividade"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Título</Label>
            <Input
              value={form.title}
              onChange={(e) => onFormChange({ ...form, title: e.target.value })}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Categoria</Label>
            <Select
              value={form.categoryId}
              onValueChange={(v) =>
                onFormChange({ ...form, categoryId: v ?? form.categoryId })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXERCISE_CATEGORIES.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Objetivo</Label>
            <Textarea
              rows={2}
              value={form.objective}
              onChange={(e) =>
                onFormChange({ ...form, objective: e.target.value })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Materiais</Label>
            <Textarea
              rows={2}
              value={form.materials}
              onChange={(e) =>
                onFormChange({ ...form, materials: e.target.value })
              }
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Instruções</Label>
            <Textarea
              rows={3}
              value={form.instructions}
              onChange={(e) =>
                onFormChange({ ...form, instructions: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Duração</Label>
              <Input
                value={form.duration}
                onChange={(e) =>
                  onFormChange({ ...form, duration: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Nível</Label>
              <Select
                value={form.level}
                onValueChange={(v) =>
                  onFormChange({ ...form, level: v ?? form.level })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EXERCISE_LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={pending} onClick={onSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
