"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAppointmentAction,
  deleteAppointmentAction,
  setAppointmentStatusAction,
  updateAppointmentAction,
} from "@/features/schedule/schedule.actions";
import type { AppointmentDTO } from "@/features/schedule/schedule.types";
import type { PatientDTO } from "@/features/patient/patient.types";
import {
  APPOINTMENT_STATUSES,
  addDaysIso,
  appointmentStatusInfo,
  formatTime,
  relativeDayLabel,
  todayIso,
  type AppointmentStatusId,
} from "@/shared/constants/appointment";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";

export function AgendaClient({
  initialDate,
  initialDay,
  initialUpcoming,
  patients,
}: {
  initialDate: string;
  initialDay: AppointmentDTO[];
  initialUpcoming: AppointmentDTO[];
  patients: PatientDTO[];
}) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [dayAppointments, setDayAppointments] = useState(initialDay);
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDTO | null>(null);
  const [pending, startTransition] = useTransition();

  const sortedPatients = useMemo(
    () => [...patients].sort((a, b) => a.name.localeCompare(b.name)),
    [patients],
  );

  function navigate(date: string) {
    setSelectedDate(date);
    router.push(`${paths.agenda}?date=${date}`);
  }

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(a: AppointmentDTO) {
    setEditing(a);
    setFormOpen(true);
  }

  function changeStatus(id: string, status: AppointmentStatusId) {
    startTransition(async () => {
      const result = await setAppointmentStatusAction({ id, status });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDayAppointments((prev) =>
        prev.map((a) => (a.id === id ? result.data : a)),
      );
      setUpcoming((prev) => prev.map((a) => (a.id === id ? result.data : a)));
      toast.success("Status atualizado");
    });
  }

  function remove(id: string) {
    if (!confirm("Excluir este agendamento?")) return;
    startTransition(async () => {
      const result = await deleteAppointmentAction({ id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDayAppointments((prev) => prev.filter((a) => a.id !== id));
      setUpcoming((prev) => prev.filter((a) => a.id !== id));
      toast.success("Agendamento removido");
      setFormOpen(false);
    });
  }

  const upcomingGroups = useMemo(() => {
    const groups: { date: string; items: AppointmentDTO[] }[] = [];
    let last: string | null = null;
    for (const a of upcoming) {
      if (a.date !== last) {
        groups.push({ date: a.date, items: [] });
        last = a.date;
      }
      groups[groups.length - 1].items.push(a);
    }
    return groups;
  }, [upcoming]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold">Agenda</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sessões agendadas da clínica
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(addDaysIso(selectedDate, -1))}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(todayIso())}
        >
          Hoje
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(addDaysIso(selectedDate, 1))}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Input
          type="date"
          className="max-w-44"
          value={selectedDate}
          onChange={(e) => navigate(e.target.value)}
        />
        <Button className="ml-auto" size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          Novo agendamento
        </Button>
      </div>

      <section className="rounded-md border border-border bg-card p-4">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {relativeDayLabel(selectedDate)}
        </p>
        {dayAppointments.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            Nenhum agendamento para este dia.
          </p>
        ) : (
          <ul className="space-y-2">
            {dayAppointments.map((a) => (
              <AppointmentRow
                key={a.id}
                appointment={a}
                pending={pending}
                onEdit={openEdit}
                onStatus={changeStatus}
              />
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-md border border-border bg-card p-4">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Próximos agendamentos
        </p>
        {upcomingGroups.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum agendamento futuro registrado.
          </p>
        ) : (
          upcomingGroups.map((g) => (
            <div key={g.date} className="mb-3">
              <p className="mb-1.5 text-xs font-semibold capitalize">
                {relativeDayLabel(g.date)}
              </p>
              <ul className="space-y-2">
                {g.items.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    pending={pending}
                    onEdit={openEdit}
                    onStatus={changeStatus}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </section>

      {formOpen && (
        <AppointmentFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          patients={sortedPatients}
          initial={editing}
          defaultDate={selectedDate}
          pending={pending}
          startTransition={startTransition}
          onDelete={editing ? () => remove(editing.id) : undefined}
          onSaved={(createdOrUpdated, isEdit, repeatCount) => {
            if (isEdit && !Array.isArray(createdOrUpdated)) {
              const updated = createdOrUpdated;
              setDayAppointments((prev) => {
                if (updated.date === selectedDate) {
                  const exists = prev.some((a) => a.id === updated.id);
                  const next = exists
                    ? prev.map((a) => (a.id === updated.id ? updated : a))
                    : [...prev, updated];
                  return next.sort((a, b) =>
                    (a.time || "").localeCompare(b.time || ""),
                  );
                }
                return prev.filter((a) => a.id !== updated.id);
              });
              setUpcoming((prev) => {
                const without = prev.filter((a) => a.id !== updated.id);
                if (updated.date >= todayIso()) {
                  return [...without, updated].sort((a, b) =>
                    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
                  );
                }
                return without;
              });
            } else if (Array.isArray(createdOrUpdated)) {
              const created = createdOrUpdated;
              setDayAppointments((prev) => {
                const forDay = created.filter((a) => a.date === selectedDate);
                if (forDay.length === 0) return prev;
                return [...prev, ...forDay].sort((a, b) =>
                  (a.time || "").localeCompare(b.time || ""),
                );
              });
              setUpcoming((prev) => {
                const fromToday = created.filter((a) => a.date >= todayIso());
                return [...prev, ...fromToday]
                  .sort((a, b) =>
                    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`),
                  )
                  .slice(0, 20);
              });
              toast.success(
                repeatCount && repeatCount > 1
                  ? `${repeatCount} agendamentos criados`
                  : "Agendamento criado",
              );
            }
            setFormOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function AppointmentRow({
  appointment,
  pending,
  onEdit,
  onStatus,
}: {
  appointment: AppointmentDTO;
  pending: boolean;
  onEdit: (a: AppointmentDTO) => void;
  onStatus: (id: string, status: AppointmentStatusId) => void;
}) {
  const st = appointmentStatusInfo(appointment.status);
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-2.5">
      <button
        type="button"
        className="min-w-0 flex-1 text-left"
        onClick={() => onEdit(appointment)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-medium">
            {formatTime(appointment.time)}
          </span>
          {appointment.duration > 0 && (
            <span className="text-xs text-muted-foreground">
              {appointment.duration} min
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium text-white"
            style={{ background: st.color }}
          >
            {st.label}
          </span>
        </div>
        <p className="mt-0.5 font-medium">
          <Link
            href={paths.paciente(appointment.patientId)}
            className="hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {appointment.patientName}
          </Link>
        </p>
        {appointment.notes && (
          <p className="text-xs text-muted-foreground">{appointment.notes}</p>
        )}
      </button>
      <select
        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
        value={appointment.status}
        disabled={pending}
        onChange={(e) =>
          onStatus(appointment.id, e.target.value as AppointmentStatusId)
        }
      >
        {APPOINTMENT_STATUSES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
    </li>
  );
}

function AppointmentFormDialog({
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
  const [duration, setDuration] = useState(initial?.duration ?? 50);
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
            <Button
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={onDelete}
            >
              <Trash2 className="size-4" />
              Excluir
            </Button>
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
