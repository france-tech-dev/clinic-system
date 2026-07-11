import type { AppointmentStatusId } from "@/shared/constants/appointment";
import { scheduleRepository } from "./schedule.repository";
import type {
  AppointmentFormInput,
  UpdateAppointmentInput,
} from "./schedule.schema";
import type { AppointmentDTO } from "./schedule.types";

function toDTO(row: {
  id: string;
  patientId: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  status: AppointmentStatusId;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; name: string };
}): AppointmentDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    patientName: row.patient.name,
    date: row.date,
    time: row.time,
    duration: row.duration,
    notes: row.notes,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listAppointmentsByDate(
  organizationId: string,
  date: string,
) {
  const rows = await scheduleRepository.findByDate(organizationId, date);
  return rows.map(toDTO);
}

export async function listUpcomingAppointments(
  organizationId: string,
  fromDate: string,
) {
  const rows = await scheduleRepository.findUpcoming(organizationId, fromDate);
  return rows.map(toDTO);
}

export async function listAppointmentsByDateRange(
  organizationId: string,
  startDate: string,
  endDate: string,
) {
  const rows = await scheduleRepository.findByDateRange(
    organizationId,
    startDate,
    endDate,
  );
  return rows.map(toDTO);
}

export async function createAppointments(
  organizationId: string,
  data: AppointmentFormInput,
) {
  const rows = await scheduleRepository.createMany(organizationId, data);
  if (!rows) return null;
  return rows.map(toDTO);
}

export async function updateAppointment(
  organizationId: string,
  data: UpdateAppointmentInput,
) {
  const row = await scheduleRepository.update(organizationId, data);
  return row ? toDTO(row) : null;
}

export async function setAppointmentStatus(
  organizationId: string,
  id: string,
  status: AppointmentStatusId,
) {
  const row = await scheduleRepository.setStatus(organizationId, id, status);
  return row ? toDTO(row) : null;
}

export async function rescheduleAppointment(
  organizationId: string,
  id: string,
  date: string,
  time: string,
): Promise<AppointmentDTO | "not_found" | "invalid_status"> {
  const existing = await scheduleRepository.findById(organizationId, id);
  if (!existing) return "not_found";
  if (existing.status !== "agendado") return "invalid_status";

  const row = await scheduleRepository.reschedule(
    organizationId,
    id,
    date,
    time,
  );
  return row ? toDTO(row) : "not_found";
}

export async function deleteAppointment(organizationId: string, id: string) {
  return scheduleRepository.delete(organizationId, id);
}

export async function getAgendaPageData(
  organizationId: string,
  selectedDate: string,
  today: string,
) {
  const [dayAppointments, upcoming] = await Promise.all([
    listAppointmentsByDate(organizationId, selectedDate),
    listUpcomingAppointments(organizationId, today),
  ]);
  return { dayAppointments, upcoming };
}
