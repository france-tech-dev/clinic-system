import {
  CashPaymentMethod,
  CashTransactionType,
} from "../../../prisma/generated/prisma/enums";

export const CASH_TRANSACTION_TYPES = [
  { id: CashTransactionType.INCOME, label: "Entrada" },
  { id: CashTransactionType.EXPENSE, label: "Saída" },
] as const;

export const CASH_PAYMENT_METHODS = [
  { id: CashPaymentMethod.CASH, label: "Dinheiro" },
  { id: CashPaymentMethod.PIX, label: "PIX" },
  { id: CashPaymentMethod.CARD, label: "Cartão" },
  { id: CashPaymentMethod.TRANSFER, label: "Transferência" },
  { id: CashPaymentMethod.OTHER, label: "Outro" },
] as const;

export function cashPaymentMethodLabel(id: CashPaymentMethod): string {
  return CASH_PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}

export function cashTransactionTypeLabel(id: CashTransactionType): string {
  return CASH_TRANSACTION_TYPES.find((t) => t.id === id)?.label ?? id;
}
