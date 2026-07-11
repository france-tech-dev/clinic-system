"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createExerciseAction,
  deleteExerciseAction,
  restoreDefaultExercisesAction,
  updateExerciseAction,
} from "@/features/exercise/exercise.actions";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import {
  EXERCISE_CATEGORIES,
  categoryOf,
} from "@/shared/constants/exercise-categories";
import { CategoryChip } from "./_components/category-chip";
import { ExerciseDetailDialog } from "./_components/exercise-detail-dialog";
import { ExerciseFormDialog } from "./_components/exercise-form-dialog";
import {
  emptyExerciseForm,
  type ExerciseFormState,
} from "./_components/exercise-form-types";

export function BibliotecaClient({
  initialExercises,
}: {
  initialExercises: ExerciseDTO[];
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ExerciseDTO | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExerciseDTO | null>(null);
  const [form, setForm] = useState<ExerciseFormState>(emptyExerciseForm());
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exercises.filter((e) => {
      const matchCat = !categoryId || e.categoryId === categoryId;
      const matchQ =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.objective.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [exercises, search, categoryId]);

  function openCreate() {
    setEditing(null);
    setForm(emptyExerciseForm());
    setFormOpen(true);
  }

  function openEdit(ex: ExerciseDTO) {
    setEditing(ex);
    setForm({
      title: ex.title,
      categoryId: ex.categoryId,
      objective: ex.objective,
      materials: ex.materials,
      instructions: ex.instructions,
      duration: ex.duration,
      level: ex.level,
    });
    setDetail(null);
    setFormOpen(true);
  }

  function save() {
    startTransition(async () => {
      const payload = editing ? { id: editing.id, ...form } : form;
      const result = editing
        ? await updateExerciseAction(payload)
        : await createExerciseAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setExercises((prev) => {
        if (editing) {
          return prev.map((e) => (e.id === result.data.id ? result.data : e));
        }
        return [...prev, result.data].sort((a, b) =>
          a.title.localeCompare(b.title),
        );
      });
      toast.success(editing ? "Atividade atualizada" : "Atividade adicionada");
      setFormOpen(false);
    });
  }

  function remove(ex: ExerciseDTO) {
    if (!confirm(`Remover "${ex.title}" da biblioteca?`)) return;
    startTransition(async () => {
      const result = await deleteExerciseAction({ id: ex.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setExercises((prev) => prev.filter((e) => e.id !== ex.id));
      setDetail(null);
      toast.success("Atividade removida");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} atividades
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => {
              if (
                !confirm(
                  "Adicionar novamente as atividades padrão à biblioteca? As existentes não serão removidas.",
                )
              )
                return;
              startTransition(async () => {
                const result = await restoreDefaultExercisesAction();
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                setExercises(result.data);
                toast.success("Biblioteca padrão restaurada");
              });
            }}
          >
            <RotateCcw className="size-4" />
            Restaurar padrão
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nova atividade
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar atividade por nome ou objetivo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CategoryChip
          label="Todas"
          active={!categoryId}
          color="#23281F"
          onClick={() => setCategoryId(null)}
        />
        {EXERCISE_CATEGORIES.map((c) => (
          <CategoryChip
            key={c.id}
            label={c.label}
            color={c.color}
            active={categoryId === c.id}
            onClick={() => setCategoryId(c.id)}
          />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => {
          const cat = categoryOf(ex.categoryId);
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => setDetail(ex)}
              className="rounded-md border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: cat.color }}
                />
                <span className="text-xs text-muted-foreground">{cat.label}</span>
              </div>
              <h3 className="font-serif text-lg font-semibold">{ex.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {ex.objective}
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                {ex.level} · {ex.duration || "—"}
              </p>
            </button>
          );
        })}
      </div>

      <ExerciseDetailDialog
        exercise={detail}
        pending={pending}
        onClose={() => setDetail(null)}
        onEdit={openEdit}
        onRemove={remove}
      />

      <ExerciseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
        form={form}
        onFormChange={setForm}
        pending={pending}
        onSave={save}
      />
    </div>
  );
}
