import { formatDateBR } from "@/shared/lib/format-date-br";
import type { CashPeriod, PeriodPreset } from "@/shared/types/cash-period";
import {
  endOfMonth,
  endOfWeek,
  format,
  parse,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns";
import { formatMonthLabel, parseMonthParam } from "./month-utils";

export type { CashPeriod, PeriodPreset } from "@/shared/types/cash-period";

export const PERIOD_PRESETS = [
  { id: "today" as const, label: "Hoje" },
  { id: "week" as const, label: "Esta semana" },
  { id: "month" as const, label: "Este mês" },
  { id: "7d" as const, label: "Últimos 7 dias" },
  { id: "30d" as const, label: "Últimos 30 dias" },
  { id: "custom" as const, label: "Customizado" },
];

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

function toIsoDay(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function parseIsoDay(value: string | undefined): string | null {
  if (!value || !ISO_DAY.test(value)) return null;
  const d = parse(value, "yyyy-MM-dd", new Date());
  if (Number.isNaN(d.getTime())) return null;
  return toIsoDay(d);
}

function rangeLabel(start: string, end: string): string {
  if (start === end) return formatDateBR(start);
  return `${formatDateBR(start)} — ${formatDateBR(end)}`;
}

export function resolvePresetBounds(
  preset: Exclude<PeriodPreset, "custom">,
  now = new Date(),
): { start: string; end: string } {
  const today = toIsoDay(now);
  switch (preset) {
    case "today":
      return { start: today, end: today };
    case "week":
      return {
        start: toIsoDay(startOfWeek(now, { weekStartsOn: 1 })),
        end: toIsoDay(endOfWeek(now, { weekStartsOn: 1 })),
      };
    case "month":
      return {
        start: toIsoDay(startOfMonth(now)),
        end: toIsoDay(endOfMonth(now)),
      };
    case "7d":
      return { start: toIsoDay(subDays(now, 6)), end: today };
    case "30d":
      return { start: toIsoDay(subDays(now, 29)), end: today };
  }
}

function labelForPeriod(
  preset: PeriodPreset,
  start: string,
  end: string,
): string {
  if (preset === "month" && start.slice(0, 7) === end.slice(0, 7)) {
    return formatMonthLabel(start.slice(0, 7));
  }
  const presetMeta = PERIOD_PRESETS.find((p) => p.id === preset);
  if (
    preset !== "custom" &&
    presetMeta &&
    start === end &&
    preset === "today"
  ) {
    return presetMeta.label;
  }
  if (
    preset === "week" ||
    preset === "7d" ||
    preset === "30d" ||
    preset === "custom"
  ) {
    return rangeLabel(start, end);
  }
  if (preset === "today") return presetMeta?.label ?? rangeLabel(start, end);
  return rangeLabel(start, end);
}

export function buildCashPeriod(
  preset: PeriodPreset,
  start: string,
  end: string,
): CashPeriod {
  const ordered = start <= end ? { start, end } : { start: end, end: start };
  return {
    preset,
    start: ordered.start,
    end: ordered.end,
    label: labelForPeriod(preset, ordered.start, ordered.end),
  };
}

export type CashPeriodSearchParams = {
  period?: string;
  from?: string;
  to?: string;
  /** Legado `?month=yyyy-MM`. */
  month?: string;
};

/** Interpreta searchParams do dashboard/caixa num período efectivo. */
export function parseCashPeriodParams(
  params: CashPeriodSearchParams,
  now = new Date(),
): CashPeriod {
  const rawPreset = params.period;
  const preset: PeriodPreset | null = PERIOD_PRESETS.some(
    (p) => p.id === rawPreset,
  )
    ? (rawPreset as PeriodPreset)
    : null;

  if (preset === "custom") {
    const from = parseIsoDay(params.from);
    const to = parseIsoDay(params.to);
    if (from && to) return buildCashPeriod("custom", from, to);
    const fallback = resolvePresetBounds("month", now);
    return buildCashPeriod("custom", fallback.start, fallback.end);
  }

  if (preset) {
    if (preset === "month" && params.month) {
      const month = parseMonthParam(params.month);
      const start = `${month}-01`;
      const end = toIsoDay(
        endOfMonth(parse(`${month}-01`, "yyyy-MM-dd", new Date())),
      );
      return buildCashPeriod("month", start, end);
    }
    const bounds = resolvePresetBounds(preset, now);
    return buildCashPeriod(preset, bounds.start, bounds.end);
  }

  // Legado: só ?month=
  if (params.month) {
    const month = parseMonthParam(params.month);
    const start = `${month}-01`;
    const end = toIsoDay(
      endOfMonth(parse(`${month}-01`, "yyyy-MM-dd", new Date())),
    );
    return buildCashPeriod("month", start, end);
  }

  const bounds = resolvePresetBounds("month", now);
  return buildCashPeriod("month", bounds.start, bounds.end);
}

/** Query string partilhada (sem `?`). */
export function cashPeriodToSearchParams(
  period: CashPeriod,
  extra?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  params.set("period", period.preset);
  params.set("from", period.start);
  params.set("to", period.end);
  if (period.preset === "month") {
    params.set("month", period.start.slice(0, 7));
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value) params.set(key, value);
    }
  }
  return params.toString();
}

export function shiftCashPeriodMonth(
  period: CashPeriod,
  delta: number,
): CashPeriod {
  const month = period.start.slice(0, 7);
  const date = parse(`${month}-01`, "yyyy-MM-dd", new Date());
  date.setMonth(date.getMonth() + delta);
  const start = toIsoDay(startOfMonth(date));
  const end = toIsoDay(endOfMonth(date));
  return buildCashPeriod("month", start, end);
}

export function periodPresetLabel(preset: PeriodPreset): string {
  return PERIOD_PRESETS.find((p) => p.id === preset)?.label ?? preset;
}
