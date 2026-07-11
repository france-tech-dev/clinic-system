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
import { STUDY_CATEGORIES } from "@/shared/constants/study-categories";
import { StudyCategoryChip } from "./study-category-chip";

export type StudyFormState = {
  title: string;
  categoryId: string;
  content: string;
};

export function StudyFormDialog({
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
  editing: boolean;
  form: StudyFormState;
  onFormChange: (form: StudyFormState) => void;
  pending: boolean;
  onSave: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
                onFormChange({ ...form, title: e.target.value })
              }
              placeholder="Ex: Protocolo de dessensibilização"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Área</Label>
            <div className="flex flex-wrap gap-2">
              {STUDY_CATEGORIES.map((c) => (
                <StudyCategoryChip
                  key={c.id}
                  label={c.label}
                  color={c.color}
                  active={form.categoryId === c.id}
                  onClick={() =>
                    onFormChange({ ...form, categoryId: c.id })
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
                onFormChange({ ...form, content: e.target.value })
              }
              placeholder="Anotações, resumo ou referência"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={pending || !form.title.trim() || !form.content.trim()}
            onClick={onSave}
          >
            Salvar nota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
