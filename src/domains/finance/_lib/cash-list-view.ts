import { CashTransactionStatus, CashTransactionType } from "@prisma/enums";

export const CASH_LIST_VIEWS = [
  { id: "all", label: "Todos" },
  { id: "receber", label: "A receber" },
  { id: "pagar", label: "A pagar" },
  { id: "income", label: "Entradas" },
  { id: "expense", label: "Saídas" },
] as const;

export type CashListView = (typeof CASH_LIST_VIEWS)[number]["id"];

export function parseCashListView(raw: string | undefined): CashListView {
  if (
    raw === "receber" ||
    raw === "pagar" ||
    raw === "income" ||
    raw === "expense"
  ) {
    return raw;
  }
  return "all";
}

export function cashListViewLabel(view: CashListView): string {
  return CASH_LIST_VIEWS.find((v) => v.id === view)?.label ?? "Todos";
}

type CashListTx = {
  type: CashTransactionType | string;
  status: CashTransactionStatus | string;
};

export function filterCashTransactionsByView<T extends CashListTx>(
  transactions: readonly T[],
  view: CashListView,
): T[] {
  switch (view) {
    case "receber":
      return transactions.filter(
        (tx) =>
          tx.type === CashTransactionType.INCOME &&
          tx.status === CashTransactionStatus.FORECAST,
      );
    case "pagar":
      return transactions.filter(
        (tx) =>
          tx.type === CashTransactionType.EXPENSE &&
          tx.status === CashTransactionStatus.FORECAST,
      );
    case "income":
      return transactions.filter(
        (tx) =>
          tx.type === CashTransactionType.INCOME &&
          tx.status === CashTransactionStatus.POSTED,
      );
    case "expense":
      return transactions.filter(
        (tx) =>
          tx.type === CashTransactionType.EXPENSE &&
          tx.status === CashTransactionStatus.POSTED,
      );
    default:
      return [...transactions];
  }
}
