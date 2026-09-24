import { addDaysIso, todayIso } from "@/shared/constants/appointment";
import { EvolutionStatus } from "@prisma/enums";
import {
  activitySeriesStartDate,
  buildActivityMonthSeries,
} from "./_lib/build-activity-month-series";
import {
  buildBusiestSlots,
  BUSIEST_LOOKBACK_DAYS,
} from "./_lib/build-busiest-slots";
import { buildDashboardAlerts } from "./_lib/build-dashboard-alerts";
import { buildUpcomingBirthdays } from "./_lib/upcoming-birthdays";
import { dashboardRepository } from "./dashboard.repository";
import type { DashboardActivity, DashboardData } from "./dashboard.types";

function startOfWeekIso() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function evolutionActivityLabel(status: string) {
  switch (status) {
    case EvolutionStatus.ABSENT:
      return "Evolução · Faltou";
    case EvolutionStatus.CANCELLED:
      return "Evolução · Cancelada";
    default:
      return "Evolução";
  }
}

function buildRecentActivity(
  recentAssessments: Awaited<
    ReturnType<typeof dashboardRepository.findRecentAssessments>
  >,
  recentEvolutions: Awaited<
    ReturnType<typeof dashboardRepository.findRecentEvolutions>
  >,
): DashboardActivity[] {
  return [
    ...recentAssessments.map((e) => ({
      id: e.id,
      kind: "evaluation" as const,
      patientId: e.patient.id,
      patientName: e.patient.name,
      date: e.date,
      label: `Avaliação ${e.type}`,
    })),
    ...recentEvolutions.map((s) => ({
      id: s.id,
      kind: "session" as const,
      patientId: s.patient.id,
      patientName: s.patient.name,
      date: s.date,
      label: evolutionActivityLabel(s.status),
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}

export async function getDashboardData(
  organizationId: string,
): Promise<DashboardData> {
  const weekStart = startOfWeekIso();
  const activityStart = activitySeriesStartDate(6);
  const activitySince = new Date(`${activityStart}T00:00:00`);
  const busiestStart = addDaysIso(todayIso(), -(BUSIEST_LOOKBACK_DAYS - 1));

  const [
    totalPatients,
    activePatients,
    totalAssessments,
    sessionsThisWeek,
    patients,
    recentAssessments,
    recentEvolutions,
    patientCreated,
    evolutionDates,
    assessmentDates,
    birthdayPatients,
    appointmentSlots,
  ] = await Promise.all([
    dashboardRepository.countPatients(organizationId),
    dashboardRepository.countActivePatients(organizationId),
    dashboardRepository.countAssessments(organizationId),
    dashboardRepository.countEvolutionsSince(organizationId, weekStart),
    dashboardRepository.findActivePatientsWithLastAssessment(organizationId),
    dashboardRepository.findRecentAssessments(organizationId),
    dashboardRepository.findRecentEvolutions(organizationId),
    dashboardRepository.findPatientCreatedAtsSince(
      organizationId,
      activitySince,
    ),
    dashboardRepository.findEvolutionDatesSince(organizationId, activityStart),
    dashboardRepository.findAssessmentDatesSince(organizationId, activityStart),
    dashboardRepository.findActivePatientsWithBirthDate(organizationId),
    dashboardRepository.findAppointmentSlotsSince(organizationId, busiestStart),
  ]);

  const birthdaySources = birthdayPatients.flatMap((p) =>
    p.birthDate ? [{ id: p.id, name: p.name, birthDate: p.birthDate }] : [],
  );

  return {
    stats: {
      activePatients,
      totalPatients,
      totalAssessments,
      sessionsThisWeek,
    },
    alerts: buildDashboardAlerts(patients),
    recentActivity: buildRecentActivity(recentAssessments, recentEvolutions),
    activitySeries: buildActivityMonthSeries({
      patientCreatedAts: patientCreated.map((p) => p.createdAt),
      sessionDates: evolutionDates.map((s) => s.date),
      evaluationDates: assessmentDates.map((e) => e.date),
    }),
    upcomingBirthdays: buildUpcomingBirthdays(
      birthdaySources,
      todayIso(),
      30,
      8,
    ),
    busiestSlots: buildBusiestSlots(appointmentSlots),
  };
}
