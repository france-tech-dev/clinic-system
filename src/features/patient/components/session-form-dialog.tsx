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
import type {
  SessionLinkableAppointmentDTO,
  SessionNoteDTO,
} from "@/features/patient/patient.types";
import {
  appointmentStatusInfo,
  formatTime,
} from "@/shared/constants/appointment";
import { formatDateBR } from "@/shared/lib/format-date-br";

function appointmentLabel(a: SessionLinkableAppointmentDTO) {
  const st = appointmentStatusInfo(a.status);
  const when = `${formatDateBR(a.date)}${a.time ? ` · ${formatTime(a.time)}` : ""}`;
  const pro = a.professionalName ? ` — ${a.professionalName}` : "";
  return `${when} (${st.label})${pro}`;
}

export function SessionFormDialog({
  open,
  onOpenChange,
  patientId,
  appointments,
  initial,
  pending,
  startTransition,
  onSave,
  lockAppointment = false,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patientId: string;
  appointments: SessionLinkableAppointmentDTO[];
  initial: SessionNoteDTO | null;
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onSave: (s: SessionNoteDTO, isEdit: boolean) => void;
  /** Quando true, o agendamento fica fixo (ex.: aberto a partir da agenda). */
  lockAppointment?: boolean;
}) {
  const options = appointments.filter(
    (a) => !a.sessionNoteId || a.sessionNoteId === initial?.id,
  );
  const [appointmentId, setAppointmentId] = useState(
    initial?.appointmentId ?? options[0]?.id ?? "",
  );
  const [status, setStatus] = useState(initial?.status ?? "compareceu");
  const [atividades, setAtividades] = useState(initial?.atividades ?? "");
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? "");

  const lockedAppointment = lockAppointment
    ? (options.find((a) => a.id === appointmentId) ?? options[0] ?? null)
    : null;

  function submit() {
    if (!appointmentId) {
      toast.error("Selecione o agendamento");
      return;
    }
    startTransition(async () => {
      const payload = {
        patientId,
        appointmentId,
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar evolução" : "Nova evolução"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Agendamento</Label>
            {lockedAppointment ? (
              <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                {appointmentLabel(lockedAppointment)}
              </p>
            ) : options.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Não há agendamentos disponíveis. Crie um na Agenda antes de
                registrar a evolução.
              </p>
            ) : (
              <Select
                value={appointmentId}
                onValueChange={(v) => setAppointmentId(v ?? appointmentId)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o atendimento…" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {appointmentLabel(a)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="grid gap-1.5">
            <Label>Status da evolução</Label>
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
          <div className="grid gap-1.5">
            <Label>Atividades realizadas</Label>
            <Textarea
              rows={6}
              value={atividades}
              onChange={(e) => setAtividades(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Observações</Label>
            <Textarea
              rows={5}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={pending || options.length === 0 || !appointmentId}
            onClick={submit}
          >
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
