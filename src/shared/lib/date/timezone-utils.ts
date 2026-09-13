import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export const APP_TIMEZONE = "America/Sao_Paulo";

function inAppTz(date: Date): TZDate {
  return new TZDate(date.getTime(), APP_TIMEZONE);
}

export function buildAppZonedDateTime(dateYmd: string, timeHm: string): Date {
  const [year, month, day] = dateYmd.split("-").map(Number);
  const [hours, minutes] = timeHm.split(":").map(Number);
  return new Date(
    TZDate.tz(APP_TIMEZONE, year, month - 1, day, hours, minutes, 0).getTime(),
  );
}

export function formatAppZonedDateParam(date: Date): string {
  return format(inAppTz(date), "yyyy-MM-dd");
}

export function formatAppZonedTimeParam(date: Date): string {
  return format(inAppTz(date), "HH:mm");
}
