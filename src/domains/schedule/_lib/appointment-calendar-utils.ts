import {
  APPOINTMENT_WITH_EVOLUTION_COLOR,
  appointmentStatusInfo,
} from "@/shared/constants/appointment";
import { buildAppZonedDateTime } from "@/shared/lib/date/timezone-utils";
import { AppointmentStatus } from "@prisma/enums";
import { addMinutes } from "date-fns";
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
  hasEvolution: boolean;
};

export function appointmentDateTime(date: string, time: string): Date {
  return buildAppZonedDateTime(date, time);
}

export function appointmentsToCalendarEvents(
  appointments: AppointmentDTO[],
): CalendarEvent[] {
  return appointments.map((a) => {
    const start = appointmentDateTime(a.date, a.time);
    const end = addMinutes(start, a.duration);
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
      hasEvolution: a.hasEvolution,
    };
  });
}

export function calendarEventStyle(status: string, hasEvolution = false) {
  if (hasEvolution) {
    return {
      backgroundColor: APPOINTMENT_WITH_EVOLUTION_COLOR,
      borderColor: APPOINTMENT_WITH_EVOLUTION_COLOR,
      opacity: 1,
    };
  }
  const info = appointmentStatusInfo(status);
  const isInactive =
    status === AppointmentStatus.CANCELLED ||
    status === AppointmentStatus.ABSENT;
  return {
    backgroundColor: info.color,
    borderColor: info.color,
    opacity: isInactive ? 0.55 : 1,
  };
}

export function appointmentDisplayColor(status: string, hasEvolution = false) {
  if (hasEvolution) return APPOINTMENT_WITH_EVOLUTION_COLOR;
  return appointmentStatusInfo(status).color;
}
