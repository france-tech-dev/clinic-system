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
  getCurrentMemberId,
  listAppointmentsByDateRange,
  listOrganizationMembers,
} from "@/features/schedule/schedule.service";
import type {
  AppointmentDTO,
  ScheduleMemberDTO,
} from "@/features/schedule/schedule.types";
import { todayIso } from "@/shared/constants/appointment";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { AgendaClient } from "./agenda-client";

const MEMBER_FILTER_ALL = "all";

function parseMemberFilter(
  raw: string | undefined,
  members: ScheduleMemberDTO[],
): string {
  if (!raw || raw === MEMBER_FILTER_ALL) return MEMBER_FILTER_ALL;
  return members.some((m) => m.id === raw) ? raw : MEMBER_FILTER_ALL;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    view?: string;
    viewDate?: string;
    member?: string;
  }>;
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
  let members: ScheduleMemberDTO[] = [];
  let defaultMemberId = "";
  let initialMemberFilter = MEMBER_FILTER_ALL;

  try {
    const { organizationId, userId } = await requireOrgId();
    const { start, end } = monthBounds(viewDate);
    const [agenda, patientList, rangeAppointments, orgMembers, currentMemberId] =
      await Promise.all([
        getAgendaPageData(organizationId, selectedDate, today),
        listPatients(organizationId),
        listAppointmentsByDateRange(organizationId, start, end),
        listOrganizationMembers(organizationId),
        getCurrentMemberId(organizationId, userId),
      ]);
    dayAppointments = agenda.dayAppointments;
    upcoming = agenda.upcoming;
    patients = patientList;
    calendarAppointments = rangeAppointments;
    members = orgMembers;
    defaultMemberId = currentMemberId ?? orgMembers[0]?.id ?? "";
    initialMemberFilter = parseMemberFilter(params.member, orgMembers);
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
          key={`${selectedDate}-${view}-${viewDateIso}-${initialMemberFilter}`}
          initialView={view}
          initialDate={selectedDate}
          viewDateIso={viewDateIso}
          initialDay={dayAppointments}
          initialUpcoming={upcoming}
          calendarEvents={calendarEvents}
          calendarAppointments={calendarAppointments}
          patients={patients}
          members={members}
          defaultMemberId={defaultMemberId}
          initialMemberFilter={initialMemberFilter}
        />
      )}
    </AppPage>
  );
}
