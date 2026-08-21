import type { CashTransactionDTO, CashflowSummary } from "../finance.types";
import { CashTransactionType } from "../../../../prisma/generated/prisma/enums";

export function buildSummary(
  transactions: CashTransactionDTO[],
): CashflowSummary {
  let income = 0;
  let expense = 0;

  for (const tx of transactions) {
    if (tx.type === CashTransactionType.INCOME) income += tx.amount;
    else expense += tx.amount;
  }

  return {
    income,
    expense,
    balance: income - expense,
  };
}
