import type {
  CashPaymentMethodId,
  CashTransactionTypeId,
} from "@/shared/constants/cash";

export type CashTransactionDTO = {
  id: string;
  type: CashTransactionTypeId;
  amountCents: number;
  date: string;
  description: string;
  paymentMethod: CashPaymentMethodId;
  patientId: string | null;
  patientName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CashflowSummary = {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
};

export type CashflowPageData = {
  month: string;
  monthLabel: string;
  transactions: CashTransactionDTO[];
  summary: CashflowSummary;
};
