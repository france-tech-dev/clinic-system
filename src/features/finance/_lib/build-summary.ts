import type { CashTransactionDTO, CashflowSummary } from "../finance.types";

export function buildSummary(
  transactions: CashTransactionDTO[],
): CashflowSummary {
  let incomeCents = 0;
  let expenseCents = 0;

  for (const tx of transactions) {
    if (tx.type === "entrada") incomeCents += tx.amountCents;
    else expenseCents += tx.amountCents;
  }

  return {
    incomeCents,
    expenseCents,
    balanceCents: incomeCents - expenseCents,
  };
}
