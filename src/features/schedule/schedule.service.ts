import type { AppointmentStatusId } from "@/shared/constants/appointment";
import { scheduleRepository } from "./schedule.repository";
import type {
  AppointmentFormInput,
  UpdateAppointmentInput,
} from "./schedule.schema";
import type { AppointmentDTO, ScheduleMemberDTO } from "./schedule.types";

function sessionNoteKey(patientId: string, date: string) {
  return `${patientId}:${date}`;
}

type AppointmentRow = NonNullable<
  Awaited<ReturnType<typeof scheduleRepository.findById>>
>;

function professionalNameFrom(row: AppointmentRow): string {
  const name = row.member.user.name?.trim();
  return name || "Profissional";
}

function toDTO(row: AppointmentRow, sessionKeys: Set<string>): AppointmentDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    patientName: row.patient.name,
    memberId: row.memberId,
    professionalName: professionalNameFrom(row),
    date: row.date,
    time: row.time,
    duration: row.duration,
    notes: row.notes,
    status: row.status,
    hasSessionNote: sessionKeys.has(sessionNoteKey(row.patientId, row.date)),
    patientPricingType: row.patient.pricingType,
    patientPriceCents: row.patient.priceCents,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toMemberDTO(
  row: Awaited<ReturnType<typeof scheduleRepository.findOrgMembers>>[number],
): ScheduleMemberDTO {
  return {
    id: row.id,
    userId: row.userId,
    name: row.user.name?.trim() || "Sem nome",
    role: row.role,
  };
}

async function mapWithSessionKeys(
  organizationId: string,
  rows: AppointmentRow[],
  startDate: string,
  endDate: string,
) {
  const sessionKeys = await scheduleRepository.findSessionNoteKeysInRange(
    organizationId,
    startDate,
    endDate,
  );
  return rows.map((row) => toDTO(row, sessionKeys));
}

export async function listOrganizationMembers(organizationId: string) {
  const rows = await scheduleRepository.findOrgMembers(organizationId);
  return rows.map(toMemberDTO);
}

export async function getCurrentMemberId(
  organizationId: string,
  userId: string,
): Promise<string | null> {
  const member = await scheduleRepository.findMemberByUserId(
    organizationId,
    userId,
  );
  return member?.id ?? null;
}

export async function listAppointmentsByDate(
  organizationId: string,
  date: string,
) {
  const rows = await scheduleRepository.findByDate(organizationId, date);
  return mapWithSessionKeys(organizationId, rows, date, date);
}

export async function listUpcomingAppointments(
  organizationId: string,
  fromDate: string,
) {
  const rows = await scheduleRepository.findUpcoming(organizationId, fromDate);
  const endDate = rows.at(-1)?.date ?? fromDate;
  return mapWithSessionKeys(organizationId, rows, fromDate, endDate);
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
  return mapWithSessionKeys(organizationId, rows, startDate, endDate);
}

export async function createAppointments(
  organizationId: string,
  data: AppointmentFormInput,
): Promise<AppointmentDTO[] | "patient_not_found" | "member_not_found"> {
  const member = await scheduleRepository.findMemberInOrg(
    organizationId,
    data.memberId,
  );
  if (!member) return "member_not_found";

  const rows = await scheduleRepository.createMany(organizationId, data);
  if (!rows) return "patient_not_found";
  const dates = rows.map((r) => r.date).sort();
  return mapWithSessionKeys(
    organizationId,
    rows,
    dates[0] ?? data.date,
    dates.at(-1) ?? data.date,
  );
}

export async function updateAppointment(
  organizationId: string,
  data: UpdateAppointmentInput,
): Promise<AppointmentDTO | "not_found" | "member_not_found"> {
  const member = await scheduleRepository.findMemberInOrg(
    organizationId,
    data.memberId,
  );
  if (!member) return "member_not_found";

  const row = await scheduleRepository.update(organizationId, data);
  if (!row) return "not_found";
  const mapped = await mapWithSessionKeys(
    organizationId,
    [row],
    row.date,
    row.date,
  );
  return mapped[0] ?? "not_found";
}

export async function setAppointmentStatus(
  organizationId: string,
  id: string,
  status: AppointmentStatusId,
) {
  const row = await scheduleRepository.setStatus(organizationId, id, status);
  if (!row) return null;
  const mapped = await mapWithSessionKeys(
    organizationId,
    [row],
    row.date,
    row.date,
  );
  return mapped[0] ?? null;
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
  if (!row) return "not_found";
  const mapped = await mapWithSessionKeys(
    organizationId,
    [row],
    row.date,
    row.date,
  );
  return mapped[0] ?? "not_found";
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
