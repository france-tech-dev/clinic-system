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

function toDTO(row: {
  id: string;
  type: CashTransactionDTO["type"];
  amountCents: number;
  date: string;
  description: string;
  paymentMethod: CashTransactionDTO["paymentMethod"];
  patientId: string | null;
  createdAt: Date;
  updatedAt: Date;
  patient: { id: string; name: string } | null;
}): CashTransactionDTO {
  return {
    id: row.id,
    type: row.type,
    amountCents: row.amountCents,
    date: row.date,
    description: row.description,
    paymentMethod: row.paymentMethod,
    patientId: row.patientId,
    patientName: row.patient?.name ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getCashflowPageData(
  organizationId: string,
  monthParam?: string,
): Promise<CashflowPageData> {
  const month = parseMonthParam(monthParam);
  const { start, end } = monthParamToBounds(month);
  const rows = await financeRepository.findByDateRange(
    organizationId,
    start,
    end,
  );
  const transactions = rows.map(toDTO);

  return {
    month,
    monthLabel: formatMonthLabel(month),
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

export async function createCashTransaction(
  organizationId: string,
  data: CashTransactionFormInput,
) {
  await assertPatientInOrg(organizationId, data.patientId);
  const row = await financeRepository.create(organizationId, data);
  return toDTO(row);
}

export async function updateCashTransaction(
  organizationId: string,
  data: UpdateCashTransactionInput,
) {
  await assertPatientInOrg(organizationId, data.patientId);
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
