import {
  buildCashPeriod,
  parseCashPeriodParams,
  resolvePresetBounds,
  shiftCashPeriodMonth,
} from "@/domains/finance/_lib/period-utils";
import { describe, expect, it, vi } from "vitest";

describe("resolvePresetBounds", () => {
  it("resolve presets a partir de uma data fixa", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T15:00:00"));

    expect(resolvePresetBounds("today")).toEqual({
      start: "2026-09-10",
      end: "2026-09-10",
    });
    expect(resolvePresetBounds("7d")).toEqual({
      start: "2026-09-04",
      end: "2026-09-10",
    });
    expect(resolvePresetBounds("30d")).toEqual({
      start: "2026-08-12",
      end: "2026-09-10",
    });
    expect(resolvePresetBounds("month")).toEqual({
      start: "2026-09-01",
      end: "2026-09-30",
    });
    // semana começa na segunda
    expect(resolvePresetBounds("week")).toEqual({
      start: "2026-09-07",
      end: "2026-09-13",
    });

    vi.useRealTimers();
  });
});

describe("parseCashPeriodParams", () => {
  it("usa mês actual por omissão", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T12:00:00"));
    const period = parseCashPeriodParams({});
    expect(period.preset).toBe("month");
    expect(period.start).toBe("2026-09-01");
    expect(period.end).toBe("2026-09-30");
    vi.useRealTimers();
  });

  it("respeita legado ?month=", () => {
    const period = parseCashPeriodParams({ month: "2026-03" });
    expect(period.preset).toBe("month");
    expect(period.start).toBe("2026-03-01");
    expect(period.end).toBe("2026-03-31");
  });

  it("aceita custom from/to e ordena se invertido", () => {
    const period = parseCashPeriodParams({
      period: "custom",
      from: "2026-09-20",
      to: "2026-09-10",
    });
    expect(period).toMatchObject({
      preset: "custom",
      start: "2026-09-10",
      end: "2026-09-20",
    });
  });
});

describe("shiftCashPeriodMonth", () => {
  it("avança o mês mantendo preset month", () => {
    const base = buildCashPeriod("month", "2026-01-01", "2026-01-31");
    expect(shiftCashPeriodMonth(base, 1)).toMatchObject({
      preset: "month",
      start: "2026-02-01",
      end: "2026-02-28",
    });
  });
});
