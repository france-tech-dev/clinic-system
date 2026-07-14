import { addMinutes, format } from "date-fns";
import {
  APPOINTMENT_WITH_EVOLUTION_COLOR,
  appointmentStatusInfo,
} from "@/shared/constants/appointment";
import type { AppointmentDTO } from "../schedule.types";

export type CalendarEvent = {
  id: string;
  patientId: string;
  memberId: string;
  title: string;
  start: Date;
  end: Date;
  patientName: string;
  professionalName: string;
  status: string;
  hasSessionNote: boolean;
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
      patientId: a.patientId,
      memberId: a.memberId,
      title: a.patientName,
      start,
      end,
      patientName: a.patientName,
      professionalName: a.professionalName,
      status: a.status,
      hasSessionNote: a.hasSessionNote,
    };
  });
}

export function formatAppointmentDate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function formatAppointmentTime(d: Date): string {
  return format(d, "HH:mm");
}

export function calendarEventStyle(status: string, hasSessionNote = false) {
  if (hasSessionNote) {
    return {
      backgroundColor: APPOINTMENT_WITH_EVOLUTION_COLOR,
      borderColor: APPOINTMENT_WITH_EVOLUTION_COLOR,
      opacity: 1,
    };
  }
  const info = appointmentStatusInfo(status);
  const isInactive = status === "cancelado" || status === "faltou";
  return {
    backgroundColor: info.color,
    borderColor: info.color,
    opacity: isInactive ? 0.55 : 1,
  };
}

export function appointmentDisplayColor(
  status: string,
  hasSessionNote = false,
) {
  if (hasSessionNote) return APPOINTMENT_WITH_EVOLUTION_COLOR;
  return appointmentStatusInfo(status).color;
}
