import { AppError } from "@/shared/lib/app-error";
import { CashTransactionStatus } from "@prisma/enums";
import { buildSummary } from "./_lib/build-summary";
import type { CashPeriod } from "./_lib/period-utils";
import { financeRepository } from "./finance.repository";
import type {
  CashTransactionFormInput,
  UpdateCashTransactionInput,
} from "./finance.schema";
import type { CashTransactionDTO, CashflowPageData } from "./finance.types";

type CashRow = NonNullable<
  Awaited<ReturnType<typeof financeRepository.findById>>
>;

function toDTO(row: CashRow): CashTransactionDTO {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    amount: Number(row.amount),
    date: row.date,
    description: row.description,
    paymentMethod: row.paymentMethod,
    patientId: row.patientId,
    patientName: row.patient?.name ?? null,
    memberId: row.memberId,
    professionalName: row.member?.user.name?.trim() || null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getCashflowPageData(
  organizationId: string,
  period: CashPeriod,
  memberId?: string | null,
): Promise<CashflowPageData> {
  const filterMemberId = memberId?.trim() || null;
  const rows = await financeRepository.findByDateRange(
    organizationId,
    period.start,
    period.end,
    filterMemberId,
  );
  const transactions = rows.map(toDTO);

  return {
    period,
    memberFilter: filterMemberId,
    transactions,
    summary: buildSummary(transactions),
  };
}

async function assertPatientInOrg(
  organizationId: string,
  patientId: string | null | undefined,
) {
  if (!patientId) return;
  const exists = await financeRepository.existsPatientInOrg(
    organizationId,
    patientId,
  );
  if (!exists) throw new Error("Paciente não encontrado");
}

async function assertMemberInOrg(
  organizationId: string,
  memberId: string | null | undefined,
) {
  if (!memberId) return;
  const member = await financeRepository.findMemberInOrg(
    organizationId,
    memberId,
  );
  if (!member) throw new Error("Profissional não encontrado");
}

export async function createCashTransaction(
  organizationId: string,
  data: CashTransactionFormInput,
) {
  await assertPatientInOrg(organizationId, data.patientId);
  await assertMemberInOrg(organizationId, data.memberId);
  const row = await financeRepository.create(organizationId, data);
  return toDTO(row);
}

export async function updateCashTransaction(
  organizationId: string,
  data: UpdateCashTransactionInput,
) {
  await assertPatientInOrg(organizationId, data.patientId);
  await assertMemberInOrg(organizationId, data.memberId);
  const row = await financeRepository.update(organizationId, data);
  return row ? toDTO(row) : null;
}

export async function deleteCashTransaction(
  organizationId: string,
  id: string,
) {
  const row = await financeRepository.delete(organizationId, id);
  return row ? toDTO(row) : null;
}

export async function markCashTransactionPosted(
  organizationId: string,
  id: string,
) {
  const existing = await financeRepository.findById(organizationId, id);
  if (!existing) return null;
  if (existing.status !== CashTransactionStatus.FORECAST) {
    throw new AppError("Só lançamentos previstos podem ser confirmados.");
  }
  const row = await financeRepository.markPosted(organizationId, id);
  return row ? toDTO(row) : null;
}
