/**
 * Agrega agendamentos por dia da semana e por hora×dia (heatmap).
 * Datas civis `yyyy-MM-dd` + hora `HH:mm` (ou vazio → ignora no heatmap).
 */

import type {
  BusiestHourRow,
  BusiestSlots,
  BusiestWeekday,
} from "../dashboard.types";

export const BUSIEST_HOUR_START = 7;
export const BUSIEST_HOUR_END = 20; // inclusive (último slot 20h)
/** Janela usada na query do dashboard (alinhada com o subtítulo da UI). */
export const BUSIEST_LOOKBACK_DAYS = 90;

const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"] as const;
const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

export type AppointmentSlotSource = {
  date: string;
  time: string;
};

function weekdayFromCivilDate(date: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.getDay();
}

function hourFromTime(time: string): number | null {
  const trimmed = time?.trim() ?? "";
  const m = /^(\d{1,2}):(\d{2})/.exec(trimmed);
  if (!m) return null;
  const hour = Number(m[1]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  return hour;
}

export function buildBusiestSlots(
  appointments: AppointmentSlotSource[],
): BusiestSlots {
  const weekdayCounts = Array.from({ length: 7 }, () => 0);
  const heat = Array.from(
    { length: BUSIEST_HOUR_END - BUSIEST_HOUR_START + 1 },
    () => Array.from({ length: 7 }, () => 0),
  );

  let total = 0;

  for (const a of appointments) {
    const weekday = weekdayFromCivilDate(a.date);
    if (weekday === null) continue;
    weekdayCounts[weekday] += 1;
    total += 1;

    const hour = hourFromTime(a.time);
    if (hour === null) continue;
    if (hour < BUSIEST_HOUR_START || hour > BUSIEST_HOUR_END) continue;
    heat[hour - BUSIEST_HOUR_START][weekday] += 1;
  }

  let maxHourCount = 0;
  for (const row of heat) {
    for (const n of row) {
      if (n > maxHourCount) maxHourCount = n;
    }
  }

  const weekdays: BusiestWeekday[] = weekdayCounts.map((count, weekday) => ({
    weekday,
    shortLabel: WEEKDAY_SHORT[weekday],
    label: WEEKDAY_LABELS[weekday],
    count,
  }));

  const hours: BusiestHourRow[] = heat.map((counts, i) => {
    const hour = BUSIEST_HOUR_START + i;
    return {
      hour,
      label: `${String(hour).padStart(2, "0")}h`,
      counts: [...counts],
    };
  });

  return { weekdays, hours, maxHourCount, total };
}
