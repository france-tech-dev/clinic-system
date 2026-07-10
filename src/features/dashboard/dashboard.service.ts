import { db } from "@/shared/lib/prisma";

export type DashboardStats = {
  activePatients: number;
  totalPatients: number;
  totalExercises: number;
  totalEvaluations: number;
  sessionsThisWeek: number;
};

export type DashboardAlert = {
  patientId: string;
  patientName: string;
  kind: "sem_avaliacao" | "reavaliacao";
  detail: string;
};

export type DashboardActivity = {
  id: string;
  kind: "evaluation" | "session";
  patientId: string;
  patientName: string;
  date: string;
  label: string;
};

export type DashboardTodayAppointment = {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  duration: number;
  status: string;
  notes: string;
};

export type DashboardData = {
  stats: DashboardStats;
  alerts: DashboardAlert[];
  recentActivity: DashboardActivity[];
  todayAppointments: DashboardTodayAppointment[];
};

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

export async function getDashboardData(
  organizationId: string,
): Promise<DashboardData> {
  const weekStart = startOfWeekIso();
  const today = todayIso();

  const [
    totalPatients,
    activePatients,
    totalExercises,
    totalEvaluations,
    sessionsThisWeek,
    patients,
    recentEvals,
    recentSessions,
    todayAppts,
  ] = await Promise.all([
    db.patient.count({ where: { organizationId } }),
    db.patient.count({ where: { organizationId, status: "ativo" } }),
    db.exercise.count({ where: { organizationId } }),
    db.evaluation.count({
      where: { patient: { organizationId } },
    }),
    db.sessionNote.count({
      where: {
        patient: { organizationId },
        date: { gte: weekStart },
      },
    }),
    db.patient.findMany({
      where: { organizationId, status: "ativo" },
      include: {
        evaluations: {
          orderBy: { date: "desc" },
          take: 1,
          select: { date: true },
        },
      },
    }),
    db.evaluation.findMany({
      where: { patient: { organizationId } },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      take: 8,
    }),
    db.sessionNote.findMany({
      where: { patient: { organizationId } },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: { date: "desc" },
      take: 8,
    }),
    db.appointment.findMany({
      where: { organizationId, date: today },
      include: { patient: { select: { id: true, name: true } } },
      orderBy: [{ time: "asc" }],
    }),
  ]);

  const alerts: DashboardAlert[] = [];
  const now = new Date();
  for (const p of patients) {
    const last = p.evaluations[0]?.date;
    if (!last) {
      alerts.push({
        patientId: p.id,
        patientName: p.name,
        kind: "sem_avaliacao",
        detail: "Sem avaliação registrada",
      });
      continue;
    }
    const lastDate = new Date(last);
    const days = Math.floor(
      (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days >= 90) {
      alerts.push({
        patientId: p.id,
        patientName: p.name,
        kind: "reavaliacao",
        detail: `Última avaliação há ${days} dias`,
      });
    }
  }

  const recentActivity: DashboardActivity[] = [
    ...recentEvals.map((e) => ({
      id: e.id,
      kind: "evaluation" as const,
      patientId: e.patient.id,
      patientName: e.patient.name,
      date: e.date,
      label: `Avaliação ${e.tipo}`,
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

  return {
    stats: {
      activePatients,
      totalPatients,
      totalExercises,
      totalEvaluations,
      sessionsThisWeek,
    },
    alerts: alerts.slice(0, 8),
    recentActivity,
    todayAppointments: todayAppts.map((a) => ({
      id: a.id,
      patientId: a.patient.id,
      patientName: a.patient.name,
      time: a.time,
      duration: a.duration,
      status: a.status,
      notes: a.notes,
    })),
  };
}
