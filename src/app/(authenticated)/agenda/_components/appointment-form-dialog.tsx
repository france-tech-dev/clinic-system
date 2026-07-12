"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAppointmentAction,
  updateAppointmentAction,
} from "@/features/schedule/schedule.actions";
import type { AppointmentDTO } from "@/features/schedule/schedule.types";
import type { PatientDTO } from "@/features/patient/patient.types";
import {
  APPOINTMENT_STATUSES,
  type AppointmentStatusId,
} from "@/shared/constants/appointment";
import { cn } from "@/shared/lib/utils";

export function AppointmentFormDialog({
  open,
  onOpenChange,
  patients,
  initial,
  defaultDate,
  pending,
  startTransition,
  onSaved,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patients: PatientDTO[];
  initial: AppointmentDTO | null;
  defaultDate: string;
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onSaved: (
    data: AppointmentDTO | AppointmentDTO[],
    isEdit: boolean,
    repeatCount?: number,
  ) => void;
  onDelete?: () => void;
}) {
  const [patientId, setPatientId] = useState(
    initial?.patientId ?? patients[0]?.id ?? "",
  );
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [time, setTime] = useState(initial?.time ?? "");
  const [duration, setDuration] = useState(initial?.duration ?? 45);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [status, setStatus] = useState(initial?.status ?? "agendado");
  const [repeatWeeks, setRepeatWeeks] = useState(1);

  function submit() {
    startTransition(async () => {
      if (initial) {
        const result = await updateAppointmentAction({
          id: initial.id,
          patientId,
          date,
          time,
          duration,
          notes,
          status,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Agendamento atualizado");
        onSaved(result.data, true);
        return;
      }
      const result = await createAppointmentAction({
        patientId,
        date,
        time,
        duration,
        notes,
        repeatWeeks,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      onSaved(result.data, false, repeatWeeks);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar agendamento" : "Novo agendamento"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Paciente</Label>
            <Select
              value={patientId}
              onValueChange={(v) => setPatientId(v ?? patientId)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione…" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
              <Label>Horário</Label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Duração (min)</Label>
            <Input
              type="number"
              min={0}
              step={5}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 0)}
            />
          </div>
          {initial ? (
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select
                value={status}
                onValueChange={(v) =>
                  setStatus((v as AppointmentStatusId) ?? status)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_STATUSES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid gap-1.5">
              <Label>Repetir semanalmente</Label>
              <Input
                type="number"
                min={1}
                max={52}
                value={repeatWeeks}
                onChange={(e) =>
                  setRepeatWeeks(Math.max(1, Number(e.target.value) || 1))
                }
              />
              <p className="text-xs text-muted-foreground">
                Número de semanas (1 = sem repetição)
              </p>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label>Observações (opcional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: primeira sessão, trazer relatório escolar"
            />
          </div>
        </div>
        <DialogFooter className={cn(initial && "sm:justify-between")}>
          {initial && onDelete && (
            <DeleteConfirmDialog
              title="Excluir agendamento?"
              description="Esta ação não pode ser desfeita. O agendamento será removido permanentemente."
              onConfirm={onDelete}
              disabled={pending}
            >
              <Button variant="destructive" size="sm" disabled={pending}>
                <Trash2 className="size-4" />
                Excluir
              </Button>
            </DeleteConfirmDialog>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button disabled={pending || !patientId || !date} onClick={submit}>
              Salvar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
