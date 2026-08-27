import { endOfMonth, format, parse, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export function currentMonthParam(): string {
  return format(new Date(), "yyyy-MM");
}

export function parseMonthParam(value: string | undefined): string {
  if (value && /^\d{4}-\d{2}$/.test(value)) return value;
  return currentMonthParam();
}

export function monthParamToBounds(monthParam: string) {
  const date = parse(`${monthParam}-01`, "yyyy-MM-dd", new Date());
  return {
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd"),
    label: format(date, "MMMM yyyy", { locale: undefined }),
  };
}

export function shiftMonthParam(monthParam: string, delta: number): string {
  const date = parse(`${monthParam}-01`, "yyyy-MM-dd", new Date());
  date.setMonth(date.getMonth() + delta);
  return format(date, "yyyy-MM");
}

export function formatMonthLabel(monthParam: string): string {
  const date = parse(`${monthParam}-01`, "yyyy-MM-dd", new Date());
  const label = format(date, "MMMM yyyy", { locale: ptBR });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
