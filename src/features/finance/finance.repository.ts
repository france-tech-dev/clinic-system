import { db } from "@/shared/lib/prisma";
import type {
  CashPaymentMethodId,
  CashTransactionTypeId,
} from "@/shared/constants/cash";
import type {
  CashTransactionFormInput,
  UpdateCashTransactionInput,
} from "./finance.schema";

const includePatient = {
  patient: { select: { id: true, name: true } },
} as const;

export const financeRepository = {
  async findByDateRange(
    organizationId: string,
    startDate: string,
    endDate: string,
  ) {
    return db.cashTransaction.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
      },
      include: includePatient,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  },

  async findById(organizationId: string, id: string) {
    return db.cashTransaction.findFirst({
      where: { id, organizationId },
      include: includePatient,
    });
  },

  async create(organizationId: string, data: CashTransactionFormInput) {
    return db.cashTransaction.create({
      data: {
        organizationId,
        type: data.type as CashTransactionTypeId,
        amountCents: data.amountCents,
        date: data.date,
        description: data.description,
        paymentMethod: data.paymentMethod as CashPaymentMethodId,
        patientId: data.patientId ?? null,
      },
      include: includePatient,
    });
  },

  async update(organizationId: string, data: UpdateCashTransactionInput) {
    const existing = await db.cashTransaction.findFirst({
      where: { id: data.id, organizationId },
      select: { id: true },
    });
    if (!existing) return null;

    return db.cashTransaction.update({
      where: { id: data.id },
      data: {
        type: data.type as CashTransactionTypeId,
        amountCents: data.amountCents,
        date: data.date,
        description: data.description,
        paymentMethod: data.paymentMethod as CashPaymentMethodId,
        patientId: data.patientId ?? null,
      },
      include: includePatient,
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.cashTransaction.findFirst({
      where: { id, organizationId },
      include: includePatient,
    });
    if (!existing) return null;

    await db.cashTransaction.delete({ where: { id } });
    return existing;
  },

  async existsPatientInOrg(organizationId: string, patientId: string) {
    const patient = await db.patient.findFirst({
      where: { id: patientId, organizationId },
      select: { id: true },
    });
    return patient !== null;
  },
};
