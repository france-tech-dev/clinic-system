import { format, parse, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ActivityMonthPoint } from "../dashboard.types";

function monthKey(date: Date) {
  return format(date, "yyyy-MM");
}

function monthLabel(monthParam: string) {
  const date = parse(`${monthParam}-01`, "yyyy-MM-dd", new Date());
  const label = format(date, "MMM yy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** Últimos `months` meses (inclui o actual), do mais antigo ao mais recente. */
export function listRecentMonthKeys(months = 6, now = new Date()): string[] {
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    keys.push(monthKey(subMonths(startOfMonth(now), i)));
  }
  return keys;
}

export function activitySeriesStartDate(months = 6, now = new Date()): string {
  const keys = listRecentMonthKeys(months, now);
  return `${keys[0]}-01`;
}

export function buildActivityMonthSeries(input: {
  patientCreatedAts: Date[];
  sessionDates: string[];
  evaluationDates: string[];
  months?: number;
  now?: Date;
}): ActivityMonthPoint[] {
  const keys = listRecentMonthKeys(input.months ?? 6, input.now ?? new Date());
  const patients = Object.fromEntries(keys.map((k) => [k, 0]));
  const sessions = Object.fromEntries(keys.map((k) => [k, 0]));
  const evaluations = Object.fromEntries(keys.map((k) => [k, 0]));

  for (const createdAt of input.patientCreatedAts) {
    const key = monthKey(createdAt);
    if (key in patients) patients[key] += 1;
  }
  for (const date of input.sessionDates) {
    const key = date.slice(0, 7);
    if (key in sessions) sessions[key] += 1;
  }
  for (const date of input.evaluationDates) {
    const key = date.slice(0, 7);
    if (key in evaluations) evaluations[key] += 1;
  }

  return keys.map((month) => ({
    month,
    label: monthLabel(month),
    patients: patients[month] ?? 0,
    sessions: sessions[month] ?? 0,
    evaluations: evaluations[month] ?? 0,
  }));
}
