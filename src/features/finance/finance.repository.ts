import { db } from "@/shared/lib/prisma";
import type {
  CashPaymentMethodId,
  CashTransactionTypeId,
} from "@/shared/constants/cash";
import type {
  CashTransactionFormInput,
  UpdateCashTransactionInput,
} from "./finance.schema";

const includeRelations = {
  patient: { select: { id: true, name: true } },
  member: {
    include: {
      user: { select: { name: true } },
    },
  },
} as const;

export const financeRepository = {
  async findByDateRange(
    organizationId: string,
    startDate: string,
    endDate: string,
    memberId?: string | null,
  ) {
    return db.cashTransaction.findMany({
      where: {
        organizationId,
        date: { gte: startDate, lte: endDate },
        ...(memberId ? { memberId } : {}),
      },
      include: includeRelations,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    });
  },

  async findById(organizationId: string, id: string) {
    return db.cashTransaction.findFirst({
      where: { id, organizationId },
      include: includeRelations,
    });
  },

  async findMemberInOrg(organizationId: string, memberId: string) {
    return db.member.findFirst({
      where: { id: memberId, organizationId },
      select: { id: true },
    });
  },

  async create(organizationId: string, data: CashTransactionFormInput) {
    return db.cashTransaction.create({
      data: {
        organizationId,
        type: data.type as CashTransactionTypeId,
        amount: data.amount,
        date: data.date,
        description: data.description,
        paymentMethod: data.paymentMethod as CashPaymentMethodId,
        patientId: data.patientId ?? null,
        memberId: data.memberId ?? null,
      },
      include: includeRelations,
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
        amount: data.amount,
        date: data.date,
        description: data.description,
        paymentMethod: data.paymentMethod as CashPaymentMethodId,
        patientId: data.patientId ?? null,
        memberId: data.memberId ?? null,
      },
      include: includeRelations,
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.cashTransaction.findFirst({
      where: { id, organizationId },
      include: includeRelations,
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
