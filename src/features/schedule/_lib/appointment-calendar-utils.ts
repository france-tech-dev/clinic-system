import { addMinutes, format } from "date-fns";
import { appointmentStatusInfo } from "@/shared/constants/appointment";
import type { AppointmentDTO } from "../schedule.types";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  patientName: string;
  status: string;
};

const DEFAULT_TIME = "09:00";

/** Converte date (YYYY-MM-DD) + time (HH:MM) em Date local. */
export function appointmentDateTime(date: string, time: string): Date {
  const trimmed = time?.trim() ?? "";
  const t =
    trimmed && /^\d{1,2}:\d{2}/.test(trimmed)
      ? trimmed.slice(0, 5).padStart(5, "0")
      : DEFAULT_TIME;
  return new Date(`${date}T${t}:00`);
}

export function appointmentsToCalendarEvents(
  appointments: AppointmentDTO[],
): CalendarEvent[] {
  return appointments.map((a) => {
    const start = appointmentDateTime(a.date, a.time);
    const end = addMinutes(start, a.duration > 0 ? a.duration : 50);
    return {
      id: a.id,
      title: a.patientName,
      start,
      end,
      patientName: a.patientName,
      status: a.status,
    };
  });
}

export function formatAppointmentDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function formatAppointmentTime(d: Date): string {
  return format(d, "HH:mm");
}

export function calendarEventStyle(status: string) {
  const info = appointmentStatusInfo(status);
  const isInactive = status === "cancelado" || status === "faltou";
  return {
    backgroundColor: info.color,
    borderColor: info.color,
    opacity: isInactive ? 0.55 : 1,
  };
}
