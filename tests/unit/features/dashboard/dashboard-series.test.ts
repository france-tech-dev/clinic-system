import { buildActivityMonthSeries } from "@/domains/dashboard/_lib/build-activity-month-series";
import { buildCashDaySeries } from "@/domains/dashboard/_lib/build-cash-day-series";
import { CashTransactionType } from "@prisma/enums";
import { describe, expect, it } from "vitest";

describe("buildCashDaySeries", () => {
  it("agrega realizados e previstos por dia do mês", () => {
    const series = buildCashDaySeries(
      [
        { date: "2026-03-01", type: CashTransactionType.INCOME, amount: 100 },
        { date: "2026-03-01", type: CashTransactionType.EXPENSE, amount: 40 },
        { date: "2026-03-02", type: CashTransactionType.INCOME, amount: 50 },
        {
          date: "2026-03-01",
          type: CashTransactionType.INCOME,
          amount: 999,
          status: "FORECAST",
        },
        {
          date: "2026-03-02",
          type: CashTransactionType.EXPENSE,
          amount: 25,
          status: "FORECAST",
        },
      ],
      "2026-03-01",
      "2026-03-31",
    );
    expect(series[0]).toMatchObject({
      date: "2026-03-01",
      income: 100,
      expense: 40,
      forecastIncome: 999,
      forecastExpense: 0,
    });
    expect(series[1]).toMatchObject({
      date: "2026-03-02",
      income: 50,
      expense: 0,
      forecastIncome: 0,
      forecastExpense: 25,
    });
    expect(series).toHaveLength(31);
  });
});

describe("buildActivityMonthSeries", () => {
  it("preenche os últimos 6 meses", () => {
    const now = new Date("2026-08-14T12:00:00");
    const series = buildActivityMonthSeries({
      now,
      patientCreatedAts: [new Date("2026-08-01T10:00:00")],
      sessionDates: ["2026-07-15", "2026-08-02"],
      evaluationDates: ["2026-08-10"],
    });
    expect(series).toHaveLength(6);
    expect(series[0]?.month).toBe("2026-03");
    expect(series.at(-1)).toMatchObject({
      month: "2026-08",
      patients: 1,
      sessions: 1,
      evaluations: 1,
    });
    expect(series[4]).toMatchObject({
      month: "2026-07",
      sessions: 1,
      patients: 0,
    });
  });
});
