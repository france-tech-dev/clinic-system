import type { CashPeriod } from "@/shared/types/cash-period";
import type { CashflowSummary } from "@/shared/types/cashflow";
import type {
  CashPaymentMethod,
  CashTransactionStatus,
  CashTransactionType,
} from "@prisma/enums";

export type { CashPeriod, PeriodPreset } from "@/shared/types/cash-period";
export type { CashflowSummary } from "@/shared/types/cashflow";

/** Opção de membro para selects do caixa (shape compatível com ScheduleMemberDTO). */
export type CashMemberOption = {
  id: string;
  name: string;
};

export type CashTransactionDTO = {
  id: string;
  type: CashTransactionType;
  status: CashTransactionStatus;
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
  period: CashPeriod;
  memberFilter: string | null;
  transactions: CashTransactionDTO[];
  summary: CashflowSummary;
};
