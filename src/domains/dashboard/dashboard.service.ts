import { SessionNoteStatus } from "@prisma/enums";
import {
  activitySeriesStartDate,
  buildActivityMonthSeries,
} from "./_lib/build-activity-month-series";
import { buildDashboardAlerts } from "./_lib/build-dashboard-alerts";
import { dashboardRepository } from "./dashboard.repository";
import type {
  DashboardActivity,
  DashboardData,
} from "./dashboard.types";

function startOfWeekIso() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

function sessionActivityLabel(status: string) {
  switch (status) {
    case SessionNoteStatus.ABSENT:
      return "Evolução · Faltou";
    case SessionNoteStatus.CANCELLED:
      return "Evolução · Cancelada";
    default:
      return "Evolução";
  }
}

function buildRecentActivity(
  recentEvals: Awaited<
    ReturnType<typeof dashboardRepository.findRecentClinicalEvaluations>
  >,
  recentSessions: Awaited<
    ReturnType<typeof dashboardRepository.findRecentSessions>
  >,
): DashboardActivity[] {
  return [
    ...recentEvals.map((e) => ({
      id: e.id,
      kind: "evaluation" as const,
      patientId: e.patient.id,
      patientName: e.patient.name,
      date: e.date,
      label: `Avaliação ${e.type}`,
    })),
    ...recentSessions.map((s) => ({
      id: s.id,
      kind: "session" as const,
      patientId: s.patient.id,
      patientName: s.patient.name,
      date: s.date,
      label: sessionActivityLabel(s.status),
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

  const [
    totalPatients,
    activePatients,
    totalClinicalEvaluations,
    sessionsThisWeek,
    patients,
    recentEvals,
    recentSessions,
    patientCreated,
    sessionDates,
    evaluationDates,
  ] = await Promise.all([
    dashboardRepository.countPatients(organizationId),
    dashboardRepository.countActivePatients(organizationId),
    dashboardRepository.countClinicalEvaluations(organizationId),
    dashboardRepository.countSessionsSince(organizationId, weekStart),
    dashboardRepository.findActivePatientsWithLastClinicalEvaluation(
      organizationId,
    ),
    dashboardRepository.findRecentClinicalEvaluations(organizationId),
    dashboardRepository.findRecentSessions(organizationId),
    dashboardRepository.findPatientCreatedAtsSince(
      organizationId,
      activitySince,
    ),
    dashboardRepository.findSessionDatesSince(organizationId, activityStart),
    dashboardRepository.findEvaluationDatesSince(
      organizationId,
      activityStart,
    ),
  ]);

  return {
    stats: {
      activePatients,
      totalPatients,
      totalClinicalEvaluations,
      sessionsThisWeek,
    },
    alerts: buildDashboardAlerts(patients),
    recentActivity: buildRecentActivity(recentEvals, recentSessions),
    activitySeries: buildActivityMonthSeries({
      patientCreatedAts: patientCreated.map((p) => p.createdAt),
      sessionDates: sessionDates.map((s) => s.date),
      evaluationDates: evaluationDates.map((e) => e.date),
    }),
  };
}
