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

export type CashDayPoint = {
  date: string;
  label: string;
  income: number;
  expense: number;
};

export type ActivityMonthPoint = {
  month: string;
  label: string;
  patients: number;
  sessions: number;
  evaluations: number;
};

export type DashboardData = {
  stats: DashboardStats;
  alerts: DashboardAlert[];
  recentActivity: DashboardActivity[];
  activitySeries: ActivityMonthPoint[];
};

export type DashboardPageData = DashboardData & {
  financeSummary: CashflowSummary;
  financeMonthLabel: string;
  cashSeries: CashDayPoint[];
};
