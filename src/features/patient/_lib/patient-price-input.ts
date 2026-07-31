import { amountToBrlInput, parseBrl } from "@/shared/lib/money-utils";

export function parsePatientPriceInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return parseBrl(trimmed);
}

export function formatPatientPriceInput(price: number | null): string {
  if (price === null || price <= 0) return "";
  return amountToBrlInput(price);
}
