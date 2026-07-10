"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Search, Trash2 } from "lucide-react";
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
import {
  createExerciseAction,
  deleteExerciseAction,
  restoreDefaultExercisesAction,
  updateExerciseAction,
} from "@/features/exercise/exercise.actions";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import {
  EXERCISE_CATEGORIES,
  EXERCISE_LEVELS,
  categoryOf,
} from "@/shared/constants/exercise-categories";
import { cn } from "@/shared/lib/utils";

type FormState = {
  title: string;
  categoryId: string;
  objective: string;
  materials: string;
  instructions: string;
  duration: string;
  level: string;
};

const emptyForm = (): FormState => ({
  title: "",
  categoryId: EXERCISE_CATEGORIES[0].id,
  objective: "",
  materials: "",
  instructions: "",
  duration: "",
  level: EXERCISE_LEVELS[0],
});

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
  const [form, setForm] = useState<FormState>(emptyForm());
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
    setForm(emptyForm());
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
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Biblioteca</h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
        <Chip
          label="Todas"
          active={!categoryId}
          color="#23281F"
          onClick={() => setCategoryId(null)}
        />
        {EXERCISE_CATEGORIES.map((c) => (
          <Chip
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

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">
                  {detail.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <Field label="Categoria">
                  {categoryOf(detail.categoryId).label}
                </Field>
                <Field label="Objetivo">{detail.objective}</Field>
                <Field label="Materiais">{detail.materials || "—"}</Field>
                <Field label="Instruções">{detail.instructions}</Field>
                <Field label="Duração">{detail.duration || "—"}</Field>
                <Field label="Nível">{detail.level}</Field>
              </div>
              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={pending}
                  onClick={() => remove(detail)}
                >
                  <Trash2 className="size-4" />
                  Remover
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDetail(null)}>
                    Fechar
                  </Button>
                  <Button onClick={() => openEdit(detail)}>Editar</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
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
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Categoria</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) =>
                  setForm({ ...form, categoryId: v ?? form.categoryId })
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
                  setForm({ ...form, objective: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Materiais</Label>
              <Textarea
                rows={2}
                value={form.materials}
                onChange={(e) =>
                  setForm({ ...form, materials: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Instruções</Label>
              <Textarea
                rows={3}
                value={form.instructions}
                onChange={(e) =>
                  setForm({ ...form, instructions: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Duração</Label>
                <Input
                  value={form.duration}
                  onChange={(e) =>
                    setForm({ ...form, duration: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Nível</Label>
                <Select
                  value={form.level}
                  onValueChange={(v) =>
                    setForm({ ...form, level: v ?? form.level })
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
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button disabled={pending} onClick={save}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Chip({
  label,
  color,
  active,
  onClick,
}: {
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "text-foreground" : "text-muted-foreground",
      )}
      style={{
        borderColor: active ? color : undefined,
        background: active ? `${color}22` : undefined,
      }}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 whitespace-pre-line">{children}</p>
    </div>
  );
}
