import type { CashPeriod } from "@/shared/types/cash-period";
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
  forecastIncome: number;
  forecastExpense: number;
};

export type ActivityMonthPoint = {
  month: string;
  label: string;
  patients: number;
  sessions: number;
  evaluations: number;
};

export type UpcomingBirthday = {
  patientId: string;
  patientName: string;
  nextDate: string;
  dayMonthLabel: string;
  turningAge: number;
};

export type BusiestWeekday = {
  weekday: number;
  shortLabel: string;
  label: string;
  count: number;
};

export type BusiestHourRow = {
  hour: number;
  label: string;
  counts: number[];
};

export type BusiestSlots = {
  weekdays: BusiestWeekday[];
  hours: BusiestHourRow[];
  maxHourCount: number;
  total: number;
};

export type DashboardData = {
  stats: DashboardStats;
  alerts: DashboardAlert[];
  recentActivity: DashboardActivity[];
  activitySeries: ActivityMonthPoint[];
  upcomingBirthdays: UpcomingBirthday[];
  busiestSlots: BusiestSlots;
};

export type DashboardPageData = DashboardData & {
  financeSummary: CashflowSummary;
  financePeriod: CashPeriod;
  cashSeries: CashDayPoint[];
};
