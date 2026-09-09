import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export const APP_TIMEZONE = "America/Sao_Paulo";

function inAppTz(date: Date): TZDate {
  return new TZDate(date.getTime(), APP_TIMEZONE);
}

export function buildAppZonedDateTime(dateYmd: string, timeHm: string): Date {
  return new Date(
    new TZDate(`${dateYmd}T${timeHm}:00`, APP_TIMEZONE).getTime(),
  );
}

export function formatAppZonedDateParam(date: Date): string {
  return format(inAppTz(date), "yyyy-MM-dd");
}

export function formatAppZonedTimeParam(date: Date): string {
  return format(inAppTz(date), "HH:mm");
}
