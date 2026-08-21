import type {
  CashPaymentMethod,
  CashTransactionType,
} from "../../../prisma/generated/prisma/enums";
import type { CashflowSummary } from "@/shared/types/cashflow";

export type { CashflowSummary } from "@/shared/types/cashflow";

/** Opção de membro para selects do caixa (shape compatível com ScheduleMemberDTO). */
export type CashMemberOption = {
  id: string;
  name: string;
};

export type CashTransactionDTO = {
  id: string;
  type: CashTransactionType;
  amount: number;
  date: string;
  description: string;
  paymentMethod: CashPaymentMethod;
  patientId: string | null;
  patientName: string | null;
  memberId: string | null;
  professionalName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CashflowPageData = {
  month: string;
  monthLabel: string;
  memberFilter: string | null;
  transactions: CashTransactionDTO[];
  summary: CashflowSummary;
};
