export const CASH_TRANSACTION_TYPES = [
  { id: "entrada" as const, label: "Entrada" },
  { id: "saida" as const, label: "Saída" },
];

export const CASH_PAYMENT_METHODS = [
  { id: "dinheiro" as const, label: "Dinheiro" },
  { id: "pix" as const, label: "PIX" },
  { id: "cartao" as const, label: "Cartão" },
  { id: "transferencia" as const, label: "Transferência" },
  { id: "outro" as const, label: "Outro" },
];

export type CashTransactionTypeId = (typeof CASH_TRANSACTION_TYPES)[number]["id"];
export type CashPaymentMethodId = (typeof CASH_PAYMENT_METHODS)[number]["id"];

export function cashPaymentMethodLabel(id: CashPaymentMethodId): string {
  return CASH_PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}

export function cashTransactionTypeLabel(id: CashTransactionTypeId): string {
  return CASH_TRANSACTION_TYPES.find((t) => t.id === id)?.label ?? id;
}
