import { z } from "zod";
import { APPOINTMENT_STATUSES } from "@/shared/constants/appointment";

const statusIds = APPOINTMENT_STATUSES.map((s) => s.id) as [
  string,
  ...string[],
];

export const appointmentFormSchema = z.object({
  patientId: z.string().min(1, "Selecione um paciente"),
  date: z.string().min(1, "Informe a data"),
  time: z.string().trim().default(""),
  duration: z.number().int().min(0).max(480).default(50),
  notes: z.string().trim().default(""),
  repeatWeeks: z.number().int().min(1).max(52).default(1),
});

export const updateAppointmentSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1, "Selecione um paciente"),
  date: z.string().min(1, "Informe a data"),
  time: z.string().trim().default(""),
  duration: z.number().int().min(0).max(480).default(50),
  notes: z.string().trim().default(""),
  status: z.enum(statusIds),
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
export type RescheduleAppointmentInput = z.infer<
  typeof rescheduleAppointmentSchema
>;
