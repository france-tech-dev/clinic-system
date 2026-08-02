"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { NotebookPen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  appointmentDialogSchema,
  type AppointmentDialogInput,
} from "@/features/schedule/schedule.schema";
import type {
  AppointmentDTO,
  ScheduleMemberDTO,
} from "@/features/schedule/schedule.types";
import type { PatientDTO } from "@/features/patient/patient.types";
import { APPOINTMENT_STATUSES } from "@/shared/constants/appointment";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";
import { cn } from "@/shared/lib/utils";

function buildDefaults(
  initial: AppointmentDTO | null,
  patients: PatientDTO[],
  members: ScheduleMemberDTO[],
  defaultMemberId: string,
  defaultDate: string,
): AppointmentDialogInput {
  return {
    patientId: initial?.patientId ?? patients[0]?.id ?? "",
    memberId: initial?.memberId ?? defaultMemberId ?? members[0]?.id ?? "",
    date: initial?.date ?? defaultDate,
    time: initial?.time ?? "",
    duration: initial?.duration ?? 45,
    notes: initial?.notes ?? "",
    status: initial?.status ?? "scheduled",
    repeatWeeks: 1,
  };
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  patients,
  members,
  defaultMemberId,
  initial,
  defaultDate,
  pending,
  startTransition,
  onSaved,
  onDelete,
  onEvolve,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patients: PatientDTO[];
  members: ScheduleMemberDTO[];
  defaultMemberId: string;
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
  onEvolve?: () => void;
}) {
  const defaults = buildDefaults(
    initial,
    patients,
    members,
    defaultMemberId,
    defaultDate,
  );

  const form = useForm<AppointmentDialogInput>({
    resolver: zodResolver(appointmentDialogSchema),
    defaultValues: defaults,
  });

  function handleOpenChange(next: boolean) {
    if (!next) {
      form.reset(defaults);
    }
    onOpenChange(next);
  }

  function onSubmit(data: AppointmentDialogInput) {
    startTransition(async () => {
      if (initial) {
        const result = await updateAppointmentAction({
          id: initial.id,
          patientId: data.patientId,
          memberId: data.memberId,
          date: data.date,
          time: data.time,
          duration: data.duration,
          notes: data.notes,
          status: data.status,
        });
        if (!result.success) {
          applyActionFieldErrors(form.setError, result.fieldErrors);
          toast.error(result.message);
          return;
        }
        toast.success("Agendamento atualizado");
        onSaved(result.data, true);
        return;
      }

      const result = await createAppointmentAction({
        patientId: data.patientId,
        memberId: data.memberId,
        date: data.date,
        time: data.time,
        duration: data.duration,
        notes: data.notes,
        repeatWeeks: data.repeatWeeks,
      });
      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.message);
        return;
      }
      onSaved(result.data, false, data.repeatWeeks);
    });
  }

  const canEvolve = Boolean(initial && onEvolve && !initial.hasSessionNote);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar agendamento" : "Novo agendamento"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id="appointment-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-3"
          >
            <FormField
              control={form.control}
              name="memberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissional *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      if (v) field.onChange(v);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paciente *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      if (v) field.onChange(v);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 items-start gap-3">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data *</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (min) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={5}
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {initial ? (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        if (v) field.onChange(v);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {APPOINTMENT_STATUSES.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="repeatWeeks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Repetir semanalmente *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={52}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(
                            Math.max(1, Number(e.target.value) || 1),
                          )
                        }
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Número de semanas (1 = sem repetição)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: primeira sessão, trazer relatório escolar"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="flex-col gap-3 sm:flex-col sm:justify-stretch">
          {canEvolve && (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={pending}
              onClick={onEvolve}
            >
              <NotebookPen data-icon="inline-start" />
              Registrar evolução
            </Button>
          )}
          <div
            className={cn(
              "flex w-full flex-col-reverse gap-2 sm:flex-row",
              initial && onDelete ? "sm:justify-between" : "sm:justify-end",
            )}
          >
            {initial && onDelete ? (
              <DeleteConfirmDialog
                title="Excluir agendamento?"
                description="Esta ação não pode ser desfeita. O agendamento será removido permanentemente."
                onConfirm={onDelete}
                disabled={pending}
              >
                <Button type="button" variant="destructive" disabled={pending}>
                  <Trash2 data-icon="inline-start" />
                  Excluir
                </Button>
              </DeleteConfirmDialog>
            ) : null}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-none"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="appointment-form"
                className="flex-1 sm:flex-none"
                disabled={pending}
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
