"use client";

import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  sessionFormSchema,
  updateSessionNoteSchema,
} from "@/features/patient/patient.schema";
import type {
  SessionLinkableAppointmentDTO,
  SessionNoteDTO,
} from "@/features/patient/patient.types";
import {
  appointmentStatusInfo,
  formatTime,
} from "@/shared/constants/appointment";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";

type SessionDialogValues = {
  id?: string;
  patientId: string;
  appointmentId: string;
  status: "attended" | "absent" | "cancelled";
  activities: string;
  observations: string;
};

function appointmentLabel(a: SessionLinkableAppointmentDTO) {
  const st = appointmentStatusInfo(a.status);
  const when = `${formatDateBR(a.date)}${a.time ? ` · ${formatTime(a.time)}` : ""}`;
  const pro = a.professionalName ? ` — ${a.professionalName}` : "";
  return `${when} (${st.label})${pro}`;
}

function buildDefaults(
  patientId: string,
  initial: SessionNoteDTO | null,
  defaultAppointmentId: string,
): SessionDialogValues {
  return {
    ...(initial ? { id: initial.id } : {}),
    patientId,
    appointmentId: initial?.appointmentId ?? defaultAppointmentId,
    status: initial?.status ?? "attended",
    activities: initial?.activities ?? "",
    observations: initial?.observations ?? "",
  };
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
  const defaultAppointmentId = options[0]?.id ?? "";

  const form = useForm<SessionDialogValues>({
    resolver: zodResolver(
      initial ? updateSessionNoteSchema : sessionFormSchema,
    ) as Resolver<SessionDialogValues>,
    defaultValues: buildDefaults(patientId, initial, defaultAppointmentId),
  });

  const appointmentId = useWatch({
    control: form.control,
    name: "appointmentId",
  });
  const status = useWatch({ control: form.control, name: "status" });

  const lockedAppointment = lockAppointment
    ? (options.find((a) => a.id === appointmentId) ?? options[0] ?? null)
    : null;

  function handleOpenChange(next: boolean) {
    if (next) {
      form.reset(buildDefaults(patientId, initial, defaultAppointmentId));
    }
    onOpenChange(next);
  }

  function onSubmit(data: SessionDialogValues) {
    startTransition(async () => {
      const payload = {
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        status: data.status,
        activities: data.activities,
        observations: data.observations,
      };
      const result = initial
        ? await updateSessionAction({ id: initial.id, ...payload })
        : await createSessionAction(payload);
      if (!result.success) {
        applyActionFieldErrors(form.setError, result.fieldErrors);
        toast.error(result.message);
        return;
      }
      toast.success(initial ? "Evolução atualizada" : "Evolução registrada");
      onSave(result.data, !!initial);
    });
  }

  const formId = `session-form-${initial?.id ?? "new"}`;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">
            {initial ? "Editar evolução" : "Nova evolução"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            id={formId}
            key={`${initial?.id ?? "new"}-${open}`}
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="appointmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agendamento *</FormLabel>
                  {lockedAppointment ? (
                    <p className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                      {appointmentLabel(lockedAppointment)}
                    </p>
                  ) : options.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Não há agendamentos disponíveis. Crie um na Agenda antes
                      de registrar a evolução.
                    </p>
                  ) : (
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        if (v) field.onChange(v);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione o atendimento…" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {options.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {appointmentLabel(a)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status da evolução *</FormLabel>
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
                      <SelectItem value="attended">Compareceu</SelectItem>
                      <SelectItem value="absent">Faltou</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {status === "attended"
                      ? "Atividades realizadas *"
                      : "Atividades realizadas"}
                  </FormLabel>
                  <FormControl>
                    <Textarea rows={6} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            disabled={pending || options.length === 0 || !appointmentId}
          >
            {pending ? <Spinner data-icon="inline-start" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
