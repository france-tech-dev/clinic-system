import { endOfMonth, format, startOfMonth } from "date-fns";

export function monthBounds(date: Date) {
  return {
    start: format(startOfMonth(date), "yyyy-MM-dd"),
    end: format(endOfMonth(date), "yyyy-MM-dd"),
  };
}

export function parseIsoDateParam(iso: string | undefined): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  return new Date(`${iso}T12:00:00`);
}
