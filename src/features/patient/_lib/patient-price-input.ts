import { centsToBrlInput, parseBrlToCents } from "@/shared/lib/money-utils";

export function parsePatientPriceInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return parseBrlToCents(trimmed);
}

export function formatPatientPriceInput(cents: number | null): string {
  if (cents === null || cents <= 0) return "";
  return centsToBrlInput(cents);
}
