import { z } from "zod";
import { APPOINTMENT_STATUSES } from "@/shared/constants/appointment";

const statusIds = APPOINTMENT_STATUSES.map((s) => s.id) as [
  string,
  ...string[],
];

const appointmentFields = {
  patientId: z.string().min(1, "Selecione um paciente"),
  memberId: z.string().min(1, "Selecione um profissional"),
  date: z.string().min(1, "Informe a data"),
  time: z.string().trim().default(""),
  duration: z.number().int().min(0).max(480).default(50),
  notes: z.string().trim().default(""),
};

export const appointmentFormSchema = z.object({
  ...appointmentFields,
  repeatWeeks: z.number().int().min(1).max(52).default(1),
});

export const updateAppointmentSchema = z.object({
  id: z.string().min(1),
  ...appointmentFields,
  status: z.enum(statusIds),
});

/** Schema do diálogo (criar + editar): status e repeatWeeks sempre presentes no form. */
export const appointmentDialogSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  memberId: z.string().min(1, "Selecione um profissional"),
  date: z.string().min(1, "Informe a data"),
  time: z.string().trim(),
  duration: z.number().int().min(0).max(480),
  notes: z.string().trim(),
  status: z.enum(statusIds),
  repeatWeeks: z.number().int().min(1).max(52),
});

export const appointmentIdSchema = z.object({
  id: z.string().min(1),
});

export const appointmentStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(statusIds),
});

export const rescheduleAppointmentSchema = z.object({
  id: z.string().min(1),
  date: z.string().min(1, "Informe a data"),
  time: z.string().trim().default(""),
});

export type AppointmentFormInput = z.infer<typeof appointmentFormSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
export type AppointmentDialogInput = z.infer<typeof appointmentDialogSchema>;
export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>;
