import { describe, expect, it } from "vitest";
import { buildActivityMonthSeries } from "@/features/dashboard/_lib/build-activity-month-series";
import { buildCashDaySeries } from "@/features/dashboard/_lib/build-cash-day-series";

describe("buildCashDaySeries", () => {
  it("agrega entradas e saídas por dia do mês", () => {
    const series = buildCashDaySeries(
      [
        { date: "2026-03-01", type: "income", amount: 100 },
        { date: "2026-03-01", type: "expense", amount: 40 },
        { date: "2026-03-02", type: "income", amount: 50 },
      ],
      "2026-03",
    );
    expect(series[0]).toMatchObject({
      date: "2026-03-01",
      income: 100,
      expense: 40,
    });
    expect(series[1]).toMatchObject({
      date: "2026-03-02",
      income: 50,
      expense: 0,
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
