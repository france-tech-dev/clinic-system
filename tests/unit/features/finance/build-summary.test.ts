import { describe, expect, it } from "vitest";
import { buildSummary } from "@/features/finance/_lib/build-summary";
import type { CashTransactionDTO } from "@/features/finance/finance.types";

function tx(
  overrides: Partial<CashTransactionDTO> & Pick<CashTransactionDTO, "type" | "amountCents">,
): CashTransactionDTO {
  return {
    id: "tx-1",
    date: "2026-01-15",
    description: "",
    paymentMethod: "pix",
    patientId: null,
    patientName: null,
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-01-15T12:00:00.000Z",
    ...overrides,
  };
}

describe("buildSummary", () => {
  it("retorna zeros quando não há lançamentos", () => {
    expect(buildSummary([])).toEqual({
      incomeCents: 0,
      expenseCents: 0,
      balanceCents: 0,
    });
  });

  it("soma entradas e saídas e calcula saldo", () => {
    const result = buildSummary([
      tx({ id: "1", type: "entrada", amountCents: 15000 }),
      tx({ id: "2", type: "entrada", amountCents: 5000 }),
      tx({ id: "3", type: "saida", amountCents: 3000 }),
    ]);

    expect(result).toEqual({
      incomeCents: 20000,
      expenseCents: 3000,
      balanceCents: 17000,
    });
  });

  it("trata só saídas com saldo negativo", () => {
    const result = buildSummary([
      tx({ id: "1", type: "saida", amountCents: 1200 }),
    ]);

    expect(result).toEqual({
      incomeCents: 0,
      expenseCents: 1200,
      balanceCents: -1200,
    });
  });
});
