"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  createEvaluationAction,
  updateEvaluationAction,
} from "@/features/patient/patient.actions";
import type { EvaluationDTO } from "@/features/patient/patient.types";
import {
  EXERCISE_CATEGORIES,
  categoryOf,
} from "@/shared/constants/exercise-categories";
import { cn } from "@/shared/lib/utils";

export function EvaluationFormDialog({
  open,
  onOpenChange,
  patientId,
  initial,
  pending,
  onSave,
  startTransition,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patientId: string;
  initial: EvaluationDTO | null;
  pending: boolean;
  onSave: (ev: EvaluationDTO, isEdit: boolean) => void;
  startTransition: (fn: () => void) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [tipo, setTipo] = useState(initial?.tipo ?? "Inicial");
  const [date, setDate] = useState(initial?.date ?? today);
  const [diagnostico, setDiagnostico] = useState(initial?.diagnostico ?? "");
  const [encaminhadoPor, setEncaminhadoPor] = useState(
    initial?.encaminhadoPor ?? "",
  );
  const [queixa, setQueixa] = useState(initial?.queixa ?? "");
  const [historia, setHistoria] = useState(initial?.historia ?? "");
  const [contextoFamiliar, setContextoFamiliar] = useState(
    initial?.contextoFamiliar ?? "",
  );
  const [nivelPrevio, setNivelPrevio] = useState(initial?.nivelPrevio ?? "");
  const [medicacoes, setMedicacoes] = useState(initial?.medicacoes ?? "");
  const [precaucoes, setPrecaucoes] = useState(initial?.precaucoes ?? "");
  const [equipamentos, setEquipamentos] = useState(initial?.equipamentos ?? "");
  const [objetivos, setObjetivos] = useState(initial?.objetivos ?? "");
  const [condutas, setCondutas] = useState(initial?.condutas ?? "");
  const [frequencia, setFrequencia] = useState(initial?.frequencia ?? "");
  const [criteriosAlta, setCriteriosAlta] = useState(
    initial?.criteriosAlta ?? "",
  );
  const [domains, setDomains] = useState(
    initial?.domains ??
      EXERCISE_CATEGORIES.map((c) => ({
        categoryId: c.id,
        score: 2,
        note: "",
      })),
  );

  function submit() {
    startTransition(async () => {
      const payload = {
        patientId,
        tipo,
        date,
        queixa,
        historia,
        domains,
        objetivos,
        condutas,
        diagnostico,
        encaminhadoPor,
        contextoFamiliar,
        nivelPrevio,
        medicacoes,
        precaucoes,
        equipamentos,
        frequencia,
        criteriosAlta,
      };
      const result = initial
        ? await updateEvaluationAction({ id: initial.id, ...payload })
        : await createEvaluationAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "Avaliação atualizada" : "Avaliação registrada");
      onSave(result.data, !!initial);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar avaliação" : "Nova avaliação"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Tipo</Label>
              <Select value={tipo} onValueChange={(v) => setTipo(v ?? tipo)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inicial">Avaliação inicial</SelectItem>
                  <SelectItem value="Reavaliação">Reavaliação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Diagnóstico / CID</Label>
              <Input
                value={diagnostico}
                onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Ex: G80 – Paralisia cerebral"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Encaminhado por</Label>
              <Input
                value={encaminhadoPor}
                onChange={(e) => setEncaminhadoPor(e.target.value)}
                placeholder="Médico, escola, família…"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Queixa principal / motivo</Label>
            <Textarea
              rows={2}
              value={queixa}
              onChange={(e) => setQueixa(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>História clínica / ocupacional</Label>
            <Textarea
              rows={3}
              value={historia}
              onChange={(e) => setHistoria(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Contexto familiar e social</Label>
            <Textarea
              rows={2}
              value={contextoFamiliar}
              onChange={(e) => setContextoFamiliar(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Nível de função prévio</Label>
            <Textarea
              rows={2}
              value={nivelPrevio}
              onChange={(e) => setNivelPrevio(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Medicações em uso</Label>
              <Input
                value={medicacoes}
                onChange={(e) => setMedicacoes(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Precauções / contraindicações</Label>
              <Input
                value={precaucoes}
                onChange={(e) => setPrecaucoes(e.target.value)}
              />
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Exame por domínio — 0 = dependente · 4 = independente
            </p>
            <div className="space-y-2">
              {domains.map((d, i) => {
                const cat = categoryOf(d.categoryId);
                return (
                  <div
                    key={d.categoryId}
                    className="rounded-md border border-border p-2"
                  >
                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                        <span
                          className="size-2 rounded-full"
                          style={{ background: cat.color }}
                        />
                        {cat.label}
                      </span>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => {
                              const next = [...domains];
                              next[i] = { ...d, score: n };
                              setDomains(next);
                            }}
                            className={cn(
                              "size-7 rounded border text-xs font-medium",
                              d.score === n
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Input
                      placeholder="Observação (opcional)"
                      value={d.note}
                      onChange={(e) => {
                        const next = [...domains];
                        next[i] = { ...d, note: e.target.value };
                        setDomains(next);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Uso de equipamentos / órteses</Label>
            <Input
              value={equipamentos}
              onChange={(e) => setEquipamentos(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Objetivos terapêuticos</Label>
            <Textarea
              rows={3}
              value={objetivos}
              onChange={(e) => setObjetivos(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Condutas / plano de intervenção</Label>
            <Textarea
              rows={3}
              value={condutas}
              onChange={(e) => setCondutas(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Frequência proposta</Label>
              <Input
                value={frequencia}
                onChange={(e) => setFrequencia(e.target.value)}
                placeholder="Ex: 2x por semana, 50 min"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Critérios de alta</Label>
              <Input
                value={criteriosAlta}
                onChange={(e) => setCriteriosAlta(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={pending} onClick={submit}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
