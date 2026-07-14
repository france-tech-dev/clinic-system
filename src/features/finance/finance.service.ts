import {
  formatMonthLabel,
  monthParamToBounds,
  parseMonthParam,
} from "./_lib/month-utils";
import { buildSummary } from "./_lib/build-summary";
import { financeRepository } from "./finance.repository";
import type {
  CashTransactionFormInput,
  UpdateCashTransactionInput,
} from "./finance.schema";
import type {
  CashTransactionDTO,
  CashflowPageData,
} from "./finance.types";

type CashRow = NonNullable<
  Awaited<ReturnType<typeof financeRepository.findById>>
>;

function toDTO(row: CashRow): CashTransactionDTO {
  return {
    id: row.id,
    type: row.type,
    amountCents: row.amountCents,
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
  monthParam?: string,
  memberId?: string | null,
): Promise<CashflowPageData> {
  const month = parseMonthParam(monthParam);
  const { start, end } = monthParamToBounds(month);
  const filterMemberId = memberId?.trim() || null;
  const rows = await financeRepository.findByDateRange(
    organizationId,
    start,
    end,
    filterMemberId,
  );
  const transactions = rows.map(toDTO);

  return {
    month,
    monthLabel: formatMonthLabel(month),
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
