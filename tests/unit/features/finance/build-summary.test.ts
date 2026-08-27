import { describe, expect, it } from "vitest";
import { buildSummary } from "@/domains/finance/_lib/build-summary";
import type { CashTransactionDTO } from "@/domains/finance/finance.types";
import {
  CashPaymentMethod,
  CashTransactionType,
} from "@prisma/enums";

function tx(
  overrides: Partial<CashTransactionDTO> &
    Pick<CashTransactionDTO, "type" | "amount">,
): CashTransactionDTO {
  return {
    id: "tx-1",
    date: "2026-01-15",
    description: "",
    paymentMethod: CashPaymentMethod.PIX,
    patientId: null,
    patientName: null,
    memberId: null,
    professionalName: null,
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-01-15T12:00:00.000Z",
    ...overrides,
  };
}

describe("buildSummary", () => {
  it("retorna zeros quando não há lançamentos", () => {
    expect(buildSummary([])).toEqual({
      income: 0,
      expense: 0,
      balance: 0,
    });
  });

  it("soma entradas e saídas e calcula saldo", () => {
    const result = buildSummary([
      tx({ id: "1", type: CashTransactionType.INCOME, amount: 150 }),
      tx({ id: "2", type: CashTransactionType.INCOME, amount: 50 }),
      tx({ id: "3", type: CashTransactionType.EXPENSE, amount: 30 }),
    ]);

    expect(result).toEqual({
      income: 200,
      expense: 30,
      balance: 170,
    });
  });

  it("trata só saídas com saldo negativo", () => {
    const result = buildSummary([
      tx({ id: "1", type: CashTransactionType.EXPENSE, amount: 12 }),
    ]);

    expect(result).toEqual({
      income: 0,
      expense: 12,
      balance: -12,
    });
  });
});
