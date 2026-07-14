import type {
  CashPaymentMethodId,
  CashTransactionTypeId,
} from "@/shared/constants/cash";

/** Opção de membro para selects do caixa (shape compatível com ScheduleMemberDTO). */
export type CashMemberOption = {
  id: string;
  name: string;
};

export type CashTransactionDTO = {
  id: string;
  type: CashTransactionTypeId;
  amountCents: number;
  date: string;
  description: string;
  paymentMethod: CashPaymentMethodId;
  patientId: string | null;
  patientName: string | null;
  memberId: string | null;
  professionalName: string | null;
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
  memberFilter: string | null;
  transactions: CashTransactionDTO[];
  summary: CashflowSummary;
};
