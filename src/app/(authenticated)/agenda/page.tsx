import { SiteHeader } from "@/components/templates/SiteHeader/site-header";
import { listPatients } from "@/features/patient/patient.service";
import type { PatientDTO } from "@/features/patient/patient.types";
import { getAgendaPageData } from "@/features/schedule/schedule.service";
import type { AppointmentDTO } from "@/features/schedule/schedule.types";
import { todayIso } from "@/shared/constants/appointment";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { AgendaClient } from "./agenda-client";

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const selectedDate = params.date || todayIso();
  const today = todayIso();

  let error: string | null = null;
  let dayAppointments: AppointmentDTO[] = [];
  let upcoming: AppointmentDTO[] = [];
  let patients: PatientDTO[] = [];

  try {
    const { organizationId } = await requireOrgId();
    const [agenda, patientList] = await Promise.all([
      getAgendaPageData(organizationId, selectedDate, today),
      listPatients(organizationId),
    ]);
    dayAppointments = agenda.dayAppointments;
    upcoming = agenda.upcoming;
    patients = patientList;
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar a agenda.";
  }

  return (
    <>
      <SiteHeader title="Agenda" />
      {error ? (
        <div className="p-6 text-sm text-destructive">{error}</div>
      ) : (
        <AgendaClient
          key={selectedDate}
          initialDate={selectedDate}
          initialDay={dayAppointments}
          initialUpcoming={upcoming}
          patients={patients}
        />
      )}
    </>
  );
}
