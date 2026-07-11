import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { appointmentsToCalendarEvents } from "@/features/schedule/_lib/appointment-calendar-utils";
import {
  monthBounds,
  parseIsoDateParam,
} from "@/features/schedule/_lib/schedule-appointments-range";
import { listPatients } from "@/features/patient/patient.service";
import type { PatientDTO } from "@/features/patient/patient.types";
import {
  getAgendaPageData,
  listAppointmentsByDateRange,
} from "@/features/schedule/schedule.service";
import type { AppointmentDTO } from "@/features/schedule/schedule.types";
import { todayIso } from "@/shared/constants/appointment";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { AgendaClient } from "./agenda-client";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string; viewDate?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date || todayIso();
  const today = todayIso();
  const view = params.view === "calendario" ? "calendario" : "lista";
  const viewDateIso = params.viewDate || selectedDate;
  const viewDate =
    parseIsoDateParam(viewDateIso) ?? new Date(`${selectedDate}T12:00:00`);

  let error: string | null = null;
  let dayAppointments: AppointmentDTO[] = [];
  let upcoming: AppointmentDTO[] = [];
  let calendarAppointments: AppointmentDTO[] = [];
  let patients: PatientDTO[] = [];

  try {
    const { organizationId } = await requireOrgId();
    const { start, end } = monthBounds(viewDate);
    const [agenda, patientList, rangeAppointments] = await Promise.all([
      getAgendaPageData(organizationId, selectedDate, today),
      listPatients(organizationId),
      listAppointmentsByDateRange(organizationId, start, end),
    ]);
    dayAppointments = agenda.dayAppointments;
    upcoming = agenda.upcoming;
    patients = patientList;
    calendarAppointments = rangeAppointments;
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar a agenda.";
  }

  const calendarEvents = appointmentsToCalendarEvents(calendarAppointments);

  return (
    <AppPage title="Agenda">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <AgendaClient
          key={`${selectedDate}-${view}-${viewDateIso}`}
          initialView={view}
          initialDate={selectedDate}
          viewDateIso={viewDateIso}
          initialDay={dayAppointments}
          initialUpcoming={upcoming}
          calendarEvents={calendarEvents}
          calendarAppointments={calendarAppointments}
          patients={patients}
        />
      )}
    </AppPage>
  );
}
