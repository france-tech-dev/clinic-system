import { buildSummary } from "@/domains/finance/_lib/build-summary";
import type { CashTransactionDTO } from "@/domains/finance/finance.types";
import {
  CashPaymentMethod,
  CashTransactionStatus,
  CashTransactionType,
} from "@prisma/enums";
import { describe, expect, it } from "vitest";

function tx(
  overrides: Partial<CashTransactionDTO> &
    Pick<CashTransactionDTO, "type" | "amount">,
): CashTransactionDTO {
  return {
    id: "tx-1",
    status: CashTransactionStatus.POSTED,
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
      forecastIncome: 0,
      forecastExpense: 0,
      projectedBalance: 0,
    });
  });

  it("soma entradas e saídas realizadas e calcula saldo", () => {
    const result = buildSummary([
      tx({ id: "1", type: CashTransactionType.INCOME, amount: 150 }),
      tx({ id: "2", type: CashTransactionType.INCOME, amount: 50 }),
      tx({ id: "3", type: CashTransactionType.EXPENSE, amount: 30 }),
    ]);

    expect(result).toEqual({
      income: 200,
      expense: 30,
      balance: 170,
      forecastIncome: 0,
      forecastExpense: 0,
      projectedBalance: 170,
    });
  });

  it("separa previsto do realizado no saldo projectado", () => {
    const result = buildSummary([
      tx({ id: "1", type: CashTransactionType.INCOME, amount: 100 }),
      tx({
        id: "2",
        type: CashTransactionType.INCOME,
        amount: 40,
        status: CashTransactionStatus.FORECAST,
      }),
      tx({
        id: "3",
        type: CashTransactionType.EXPENSE,
        amount: 10,
        status: CashTransactionStatus.FORECAST,
      }),
    ]);

    expect(result).toEqual({
      income: 100,
      expense: 0,
      balance: 100,
      forecastIncome: 40,
      forecastExpense: 10,
      projectedBalance: 130,
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
      forecastIncome: 0,
      forecastExpense: 0,
      projectedBalance: -12,
    });
  });
});
