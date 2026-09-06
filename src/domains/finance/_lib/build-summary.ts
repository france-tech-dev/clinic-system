import { CashTransactionStatus, CashTransactionType } from "@prisma/enums";
import type { CashTransactionDTO, CashflowSummary } from "../finance.types";

export function buildSummary(
  transactions: CashTransactionDTO[],
): CashflowSummary {
  let income = 0;
  let expense = 0;
  let forecastIncome = 0;
  let forecastExpense = 0;

  for (const tx of transactions) {
    const isIncome = tx.type === CashTransactionType.INCOME;
    if (tx.status === CashTransactionStatus.FORECAST) {
      if (isIncome) forecastIncome += tx.amount;
      else forecastExpense += tx.amount;
      continue;
    }
    if (isIncome) income += tx.amount;
    else expense += tx.amount;
  }

  return {
    income,
    expense,
    balance: income - expense,
    forecastIncome,
    forecastExpense,
    projectedBalance: income + forecastIncome - (expense + forecastExpense),
  };
}
