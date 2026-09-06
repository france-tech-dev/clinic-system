import { parseBrl } from "@/shared/lib/money-utils";
import {
  CashPaymentMethod,
  CashTransactionStatus,
  CashTransactionType,
} from "@prisma/enums";
import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");

const transactionType = z.enum([
  CashTransactionType.INCOME,
  CashTransactionType.EXPENSE,
]);

const transactionStatus = z.enum([
  CashTransactionStatus.POSTED,
  CashTransactionStatus.FORECAST,
]);

const paymentMethod = z.enum([
  CashPaymentMethod.CASH,
  CashPaymentMethod.PIX,
  CashPaymentMethod.CARD,
  CashPaymentMethod.TRANSFER,
  CashPaymentMethod.OTHER,
]);

export const cashTransactionFormSchema = z.object({
  type: transactionType,
  status: transactionStatus,
  date: isoDate,
  description: z
    .string()
    .trim()
    .min(1, "Informe uma descrição")
    .max(200, "Descrição muito longa"),
  amount: z.number().positive("Valor deve ser maior que zero"),
  paymentMethod: paymentMethod,
  patientId: z.string().min(1).nullable().optional(),
  memberId: z.string().min(1).nullable().optional(),
});

export const updateCashTransactionSchema = cashTransactionFormSchema.extend({
  id: z.string().cuid(),
});

/** Schema do diálogo UI: valor em string BRL; patientId/memberId vazios = nenhum. */
export const cashTransactionDraftSchema = z.object({
  type: transactionType,
  status: transactionStatus,
  date: isoDate,
  description: z
    .string()
    .trim()
    .min(1, "Informe uma descrição")
    .max(200, "Descrição muito longa"),
  amountInput: z
    .string()
    .trim()
    .min(1, "Informe um valor")
    .refine((v) => parseBrl(v) !== null, "Informe um valor válido"),
  paymentMethod: paymentMethod,
  patientId: z.string(),
  memberId: z.string(),
});

export const cashTransactionIdSchema = z.object({
  id: z.string().cuid(),
});

export type CashTransactionFormInput = z.infer<
  typeof cashTransactionFormSchema
>;
export type UpdateCashTransactionInput = z.infer<
  typeof updateCashTransactionSchema
>;
export type CashTransactionDraftInput = z.infer<
  typeof cashTransactionDraftSchema
>;
