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

function parseIdList(
  raw: string | undefined,
  validIds: ReadonlySet<string>,
): string[] {
  if (!raw?.trim()) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(",")) {
    const id = part.trim();
    if (!id || !validIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    result.push(id);
  }
  return result;
}

const CAL_VIEWS = new Set(["day", "week", "month"]);

function parseCalView(raw: string | undefined): "day" | "week" | "month" {
  return raw && CAL_VIEWS.has(raw) ? (raw as "day" | "week" | "month") : "week";
}

type AgendaPageProps = {
  searchParams: Promise<{
    date?: string;
    view?: string;
    viewDate?: string;
    calView?: string;
    member?: string;
    patient?: string;
  }>;
};

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const params = await searchParams;
  const selectedDate = params.date || todayIso();
  const today = todayIso();
  const view = params.view === "calendario" ? "calendario" : "lista";
  const calView = parseCalView(params.calView);
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
  let initialMemberFilter: string[] = [];
  let initialPatientFilter: string[] = [];

  try {
    const { organizationId, userId } = await requireOrgId();
    const { start, end } = monthBounds(viewDate);
    const [
      agenda,
      patientList,
      rangeAppointments,
      orgMembers,
      currentMemberId,
    ] = await Promise.all([
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
    initialMemberFilter = parseIdList(
      params.member,
      new Set(orgMembers.map((m) => m.id)),
    );
    initialPatientFilter = parseIdList(
      params.patient,
      new Set(patientList.map((p) => p.id)),
    );
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar a agenda.";
  }

  const calendarEvents = appointmentsToCalendarEvents(calendarAppointments);
  const filterKey = [
    initialMemberFilter.join(","),
    initialPatientFilter.join(","),
  ].join("|");

  return (
    <AppPage title="Agenda">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <AgendaClient
          key={`${selectedDate}-${view}-${viewDateIso}-${calView}-${filterKey}`}
          initialView={view}
          initialDate={selectedDate}
          viewDateIso={viewDateIso}
          initialCalView={calView}
          initialDay={dayAppointments}
          initialUpcoming={upcoming}
          calendarEvents={calendarEvents}
          calendarAppointments={calendarAppointments}
          patients={patients}
          members={members}
          defaultMemberId={defaultMemberId}
          initialMemberFilter={initialMemberFilter}
          initialPatientFilter={initialPatientFilter}
        />
      )}
    </AppPage>
  );
}
