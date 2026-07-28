import { buildDashboardAlerts } from "./_lib/build-dashboard-alerts";
import { dashboardRepository } from "./dashboard.repository";
import type {
  DashboardActivity,
  DashboardData,
  DashboardTodayAppointment,
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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
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
      label: `Evolução (${s.status})`,
    })),
  ]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);
}

function mapTodayAppointments(
  rows: Awaited<ReturnType<typeof dashboardRepository.findTodayAppointments>>,
): DashboardTodayAppointment[] {
  return rows.map((a) => ({
    id: a.id,
    patientId: a.patient.id,
    patientName: a.patient.name,
    time: a.time,
    duration: a.duration,
    status: a.status,
    notes: a.notes,
  }));
}

export async function getDashboardData(
  organizationId: string,
): Promise<DashboardData> {
  const weekStart = startOfWeekIso();
  const today = todayIso();

  const [
    totalPatients,
    activePatients,
    totalClinicalEvaluations,
    sessionsThisWeek,
    patients,
    recentEvals,
    recentSessions,
    todayAppts,
  ] = await Promise.all([
    dashboardRepository.countPatients(organizationId),
    dashboardRepository.countActivePatients(organizationId),
    dashboardRepository.countClinicalEvaluations(organizationId),
    dashboardRepository.countSessionsSince(organizationId, weekStart),
    dashboardRepository.findActivePatientsWithLastClinicalEvaluation(organizationId),
    dashboardRepository.findRecentClinicalEvaluations(organizationId),
    dashboardRepository.findRecentSessions(organizationId),
    dashboardRepository.findTodayAppointments(organizationId, today),
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
    todayAppointments: mapTodayAppointments(todayAppts),
  };
}
