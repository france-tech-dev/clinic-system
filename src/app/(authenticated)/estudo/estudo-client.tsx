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
import { cn } from "@/shared/lib/utils";

type FormState = {
  title: string;
  categoryId: string;
  content: string;
};

const emptyForm = (): FormState => ({
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
  const [form, setForm] = useState<FormState>(emptyForm());
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
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold">Estudo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
        <Chip
          label="Todas"
          active={!categoryId}
          color="#23281F"
          onClick={() => setCategoryId(null)}
        />
        {STUDY_CATEGORIES.map((c) => (
          <Chip
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

      <Dialog
        open={!!detail}
        onOpenChange={(o) => {
          if (!o) setDetail(null);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <span
                  className="mb-1 inline-flex w-fit rounded px-2 py-0.5 text-[0.625rem] font-medium text-white"
                  style={{
                    background: studyCategoryOf(detail.categoryId).color,
                  }}
                >
                  {studyCategoryOf(detail.categoryId).label}
                </span>
                <DialogTitle className="font-serif text-xl">
                  {detail.title}
                </DialogTitle>
                {detail.isCustom && (
                  <p className="font-mono text-xs tracking-wide text-primary">
                    NOTA PESSOAL
                  </p>
                )}
              </DialogHeader>
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {detail.content}
              </p>
              <DialogFooter className="gap-2 sm:justify-between">
                <Button
                  variant="destructive"
                  disabled={pending}
                  onClick={() => remove(detail)}
                >
                  <Trash2 className="size-4" />
                  Excluir
                </Button>
                <Button onClick={() => openEdit(detail)}>Editar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editing ? "Editar nota" : "Nova nota de estudo"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="study-title">Título</Label>
              <Input
                id="study-title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Ex: Protocolo de dessensibilização"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Área</Label>
              <div className="flex flex-wrap gap-2">
                {STUDY_CATEGORIES.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.label}
                    color={c.color}
                    active={form.categoryId === c.id}
                    onClick={() =>
                      setForm((f) => ({ ...f, categoryId: c.id }))
                    }
                  />
                ))}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="study-content">Conteúdo</Label>
              <Textarea
                id="study-content"
                rows={8}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Anotações, resumo ou referência"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              disabled={pending || !form.title.trim() || !form.content.trim()}
              onClick={save}
            >
              Salvar nota
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
        active
          ? "border-transparent text-white"
          : "border-border text-muted-foreground hover:border-foreground/30",
      )}
      style={active ? { background: color } : undefined}
    >
      {label}
    </button>
  );
}
