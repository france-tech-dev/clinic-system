import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { appointmentsToCalendarEvents } from "@/domains/schedule/_lib/appointment-calendar-utils";
import {
  monthBounds,
  parseIsoDateParam,
} from "@/domains/schedule/_lib/schedule-appointments-range";
import { listPatients } from "@/domains/patient/patient.service";
import type { PatientDTO } from "@/domains/patient/patient.types";
import {
  getAgendaPageData,
  getCurrentMemberId,
  listAppointmentsByDateRange,
  listOrganizationMembers,
} from "@/domains/schedule/schedule.service";
import type {
  AppointmentDTO,
  ScheduleMemberDTO,
} from "@/domains/schedule/schedule.types";
import { findProxyMember } from "@/server/auth/proxy-member";
import { todayIso } from "@/shared/constants/appointment";
import { isLeadershipRole } from "@/shared/lib/member-role";
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
  let canSuggestCash = false;

  try {
    const { organizationId, userId } = await requireOrgId();
    const { start, end } = monthBounds(viewDate);
    const [
      agenda,
      patientList,
      rangeAppointments,
      orgMembers,
      currentMemberId,
      memberGate,
    ] = await Promise.all([
      getAgendaPageData(organizationId, selectedDate, today),
      listPatients(organizationId),
      listAppointmentsByDateRange(organizationId, start, end),
      listOrganizationMembers(organizationId),
      getCurrentMemberId(organizationId, userId),
      findProxyMember(userId, organizationId),
    ]);
    dayAppointments = agenda.dayAppointments;
    upcoming = agenda.upcoming;
    patients = patientList;
    calendarAppointments = rangeAppointments;
    members = orgMembers;
    defaultMemberId = currentMemberId ?? orgMembers[0]?.id ?? "";
    canSuggestCash = isLeadershipRole(memberGate?.role ?? null);
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

  if (error) {
    return (
      <AppPage title="Agenda">
        <p className="text-sm text-destructive">{error}</p>
      </AppPage>
    );
  }

  return (
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
      canSuggestCash={canSuggestCash}
    />
  );
}
