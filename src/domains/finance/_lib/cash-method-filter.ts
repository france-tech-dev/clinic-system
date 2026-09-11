import { CASH_PAYMENT_METHODS } from "@/shared/constants/cash";
import { CashPaymentMethod } from "@prisma/enums";

export const CASH_METHOD_FILTER_ALL = "all" as const;

export type CashMethodFilter =
  typeof CASH_METHOD_FILTER_ALL | CashPaymentMethod;

export function parseCashMethodFilter(
  raw: string | undefined,
): CashMethodFilter {
  if (!raw || raw === CASH_METHOD_FILTER_ALL) return CASH_METHOD_FILTER_ALL;
  const match = CASH_PAYMENT_METHODS.find((m) => m.id === raw);
  return match ? match.id : CASH_METHOD_FILTER_ALL;
}

export function filterCashTransactionsByMethod<
  T extends { paymentMethod: CashPaymentMethod | string },
>(transactions: readonly T[], method: CashMethodFilter): T[] {
  if (method === CASH_METHOD_FILTER_ALL) return [...transactions];
  return transactions.filter((tx) => tx.paymentMethod === method);
}
