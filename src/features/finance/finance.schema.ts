import { z } from "zod";
import {
  CASH_PAYMENT_METHODS,
  CASH_TRANSACTION_TYPES,
} from "@/shared/constants/cash";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");

const transactionType = z.enum(
  CASH_TRANSACTION_TYPES.map((t) => t.id) as [
    "entrada",
    "saida",
  ],
);

const paymentMethod = z.enum(
  CASH_PAYMENT_METHODS.map((m) => m.id) as [
    "dinheiro",
    "pix",
    "cartao",
    "transferencia",
    "outro",
  ],
);

export const cashTransactionFormSchema = z.object({
  type: transactionType,
  date: isoDate,
  description: z
    .string()
    .trim()
    .min(1, "Informe uma descrição")
    .max(200, "Descrição muito longa"),
  amountCents: z
    .number()
    .int()
    .positive("Valor deve ser maior que zero"),
  paymentMethod: paymentMethod,
  patientId: z.string().cuid().nullable().optional(),
});

export const updateCashTransactionSchema = cashTransactionFormSchema.extend({
  id: z.string().cuid(),
});

export const cashTransactionIdSchema = z.object({
  id: z.string().cuid(),
});

export type CashTransactionFormInput = z.infer<typeof cashTransactionFormSchema>;
export type UpdateCashTransactionInput = z.infer<
  typeof updateCashTransactionSchema
>;
