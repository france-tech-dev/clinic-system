"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createStudyCardAction,
  deleteStudyCardAction,
  restoreDefaultStudyAction,
  updateStudyCardAction,
} from "@/features/study/study.actions";
import type { StudyCardDTO } from "@/features/study/study.types";
import {
  STUDY_CATEGORIES,
  studyCategoryOf,
} from "@/shared/constants/study-categories";
import { StudyCategoryChip } from "./_components/study-category-chip";
import { StudyDetailDialog } from "./_components/study-detail-dialog";
import {
  StudyFormDialog,
  type StudyFormState,
} from "./_components/study-form-dialog";

const emptyForm = (): StudyFormState => ({
  title: "",
  categoryId: STUDY_CATEGORIES[0].id,
  content: "",
});

export function EstudoClient({
  initialCards,
}: {
  initialCards: StudyCardDTO[];
}) {
  const [cards, setCards] = useState(initialCards);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [detail, setDetail] = useState<StudyCardDTO | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudyCardDTO | null>(null);
  const [form, setForm] = useState<StudyFormState>(emptyForm());
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards.filter((c) => {
      const matchCat = !categoryId || c.categoryId === categoryId;
      const matchQ =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.content.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [cards, search, categoryId]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setFormOpen(true);
  }

  function openEdit(card: StudyCardDTO) {
    setEditing(card);
    setForm({
      title: card.title,
      categoryId: card.categoryId,
      content: card.content,
    });
    setDetail(null);
    setFormOpen(true);
  }

  function save() {
    startTransition(async () => {
      const payload = editing ? { id: editing.id, ...form } : form;
      const result = editing
        ? await updateStudyCardAction(payload)
        : await createStudyCardAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setCards((prev) => {
        if (editing) {
          return prev.map((c) => (c.id === result.data.id ? result.data : c));
        }
        return [...prev, result.data].sort((a, b) =>
          a.title.localeCompare(b.title),
        );
      });
      toast.success(editing ? "Nota atualizada" : "Nota adicionada");
      setFormOpen(false);
    });
  }

  function remove(card: StudyCardDTO) {
    if (!confirm(`Remover "${card.title}"?`)) return;
    startTransition(async () => {
      const result = await deleteStudyCardAction({ id: card.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setCards((prev) => prev.filter((c) => c.id !== card.id));
      setDetail(null);
      toast.success("Nota removida");
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} notas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const beforeKeys = new Set(
                  cards
                    .map((c) => c.seedKey)
                    .filter((k): k is string => !!k),
                );
                const result = await restoreDefaultStudyAction();
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                setCards(result.data);
                const added = result.data.filter(
                  (c) => c.seedKey && !beforeKeys.has(c.seedKey),
                ).length;
                toast.success(
                  added > 0
                    ? `${added} resumo(s) padrão restaurado(s)`
                    : "Todos os resumos padrão já estão na sua área de estudo",
                );
              });
            }}
          >
            <RotateCcw className="size-4" />
            Restaurar padrão
          </Button>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Nova nota
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por título ou conteúdo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <StudyCategoryChip
          label="Todas"
          active={!categoryId}
          color="#23281F"
          onClick={() => setCategoryId(null)}
        />
        {STUDY_CATEGORIES.map((c) => (
          <StudyCategoryChip
            key={c.id}
            label={c.label}
            color={c.color}
            active={categoryId === c.id}
            onClick={() => setCategoryId(c.id)}
          />
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma nota encontrada.
          </p>
          <Button
            variant="link"
            className="mt-2"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await restoreDefaultStudyAction();
                if (!result.success) {
                  toast.error(result.error);
                  return;
                }
                setCards(result.data);
                toast.success("Resumos padrão restaurados");
              });
            }}
          >
            Restaurar resumos padrão
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card) => {
            const cat = studyCategoryOf(card.categoryId);
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setDetail(card)}
                className="flex flex-col rounded-md border border-border bg-card p-4 text-left transition-colors hover:border-primary/40"
              >
                <span
                  className="mb-2 inline-flex w-fit rounded px-2 py-0.5 text-[0.625rem] font-medium text-white"
                  style={{ background: cat.color }}
                >
                  {cat.label}
                </span>
                <h3 className="font-serif text-base font-semibold leading-snug">
                  {card.title}
                </h3>
                <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
                  {card.content}
                </p>
                {card.isCustom && (
                  <span className="mt-auto pt-3 font-mono text-[0.625rem] tracking-wide text-primary">
                    NOTA PESSOAL
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <StudyDetailDialog
        card={detail}
        pending={pending}
        onClose={() => setDetail(null)}
        onEdit={openEdit}
        onRemove={remove}
      />

      <StudyFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={!!editing}
        form={form}
        onFormChange={setForm}
        pending={pending}
        onSave={save}
      />
    </div>
  );
}
