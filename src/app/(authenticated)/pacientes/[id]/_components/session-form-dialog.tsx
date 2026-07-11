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
  createSessionAction,
  updateSessionAction,
} from "@/features/patient/patient.actions";
import type { SessionNoteDTO } from "@/features/patient/patient.types";

export function SessionFormDialog({
  open,
  onOpenChange,
  patientId,
  initial,
  pending,
  startTransition,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patientId: string;
  initial: SessionNoteDTO | null;
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onSave: (s: SessionNoteDTO, isEdit: boolean) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(initial?.date ?? today);
  const [status, setStatus] = useState(initial?.status ?? "compareceu");
  const [atividades, setAtividades] = useState(initial?.atividades ?? "");
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");

  function submit() {
    startTransition(async () => {
      const payload = {
        patientId,
        date,
        status: status as "compareceu" | "faltou" | "cancelado",
        atividades,
        observacoes,
      };
      const result = initial
        ? await updateSessionAction({ id: initial.id, ...payload })
        : await createSessionAction(payload);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(initial ? "Evolução atualizada" : "Evolução registrada");
      onSave(result.data, !!initial);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar evolução" : "Nova evolução"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus((v as typeof status) ?? status)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compareceu">Compareceu</SelectItem>
                  <SelectItem value="faltou">Faltou</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Atividades realizadas</Label>
            <Textarea
              rows={3}
              value={atividades}
              onChange={(e) => setAtividades(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Observações</Label>
            <Textarea
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
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
