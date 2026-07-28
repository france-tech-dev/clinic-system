export const CASH_TRANSACTION_TYPES = [
  { id: "income" as const, label: "Entrada" },
  { id: "expense" as const, label: "Saída" },
];

export const CASH_PAYMENT_METHODS = [
  { id: "cash" as const, label: "Dinheiro" },
  { id: "pix" as const, label: "PIX" },
  { id: "card" as const, label: "Cartão" },
  { id: "transfer" as const, label: "Transferência" },
  { id: "other" as const, label: "Outro" },
];

export type CashTransactionTypeId = (typeof CASH_TRANSACTION_TYPES)[number]["id"];
export type CashPaymentMethodId = (typeof CASH_PAYMENT_METHODS)[number]["id"];

export function cashPaymentMethodLabel(id: CashPaymentMethodId): string {
  return CASH_PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}

export function cashTransactionTypeLabel(id: CashTransactionTypeId): string {
  return CASH_TRANSACTION_TYPES.find((t) => t.id === id)?.label ?? id;
}
