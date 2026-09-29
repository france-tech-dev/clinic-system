import type { CashTransactionDTO } from "@/domains/finance/finance.types";
import { buildCashTransactionsCsv } from "@/features/finance/_lib/cash-csv";
import {
  CashPaymentMethod,
  CashTransactionStatus,
  CashTransactionType,
} from "@prisma/enums";
import { describe, expect, it } from "vitest";

function tx(overrides: Partial<CashTransactionDTO> = {}): CashTransactionDTO {
  return {
    id: "tx-1",
    type: CashTransactionType.INCOME,
    status: CashTransactionStatus.POSTED,
    date: "2026-01-15",
    description: "Sessão — Ana Silva",
    amount: 150,
    paymentMethod: CashPaymentMethod.PIX,
    patientId: "pat-1",
    patientName: "Ana Silva",
    memberId: null,
    professionalName: null,
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-01-15T12:00:00.000Z",
    ...overrides,
  };
}

describe("buildCashTransactionsCsv", () => {
  it("inclui a coluna Paciente e o nome no CSV", () => {
    const csv = buildCashTransactionsCsv([tx()]);
    const [header, row] = csv.replace(/^\uFEFF/, "").split("\r\n");

    expect(header.split(";")).toContain("Paciente");
    expect(row.split(";").at(-1)).toBe("Ana Silva");
  });
});
