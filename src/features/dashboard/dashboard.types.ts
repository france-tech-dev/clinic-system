import type { CashflowSummary } from "@/shared/types/cashflow";

export type DashboardStats = {
  activePatients: number;
  totalPatients: number;
  totalClinicalEvaluations: number;
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

export type DashboardPageData = DashboardData & {
  financeSummary: CashflowSummary;
  financeMonthLabel: string;
};
