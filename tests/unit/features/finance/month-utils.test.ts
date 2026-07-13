import { describe, expect, it, vi } from "vitest";
import {
  formatMonthLabel,
  monthParamToBounds,
  parseMonthParam,
  shiftMonthParam,
} from "@/features/finance/_lib/month-utils";

describe("parseMonthParam", () => {
  it("aceita yyyy-MM válido", () => {
    expect(parseMonthParam("2026-03")).toBe("2026-03");
  });

  it("rejeita formato inválido e usa mês actual", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T12:00:00"));

    expect(parseMonthParam("invalid")).toBe("2026-07");
    expect(parseMonthParam("2026-3")).toBe("2026-07");
    expect(parseMonthParam(undefined)).toBe("2026-07");

    vi.useRealTimers();
  });
});

describe("monthParamToBounds", () => {
  it("retorna primeiro e último dia do mês", () => {
    expect(monthParamToBounds("2026-02")).toEqual({
      start: "2026-02-01",
      end: "2026-02-28",
      label: "February 2026",
    });
  });
});

describe("shiftMonthParam", () => {
  it("avança e recua meses", () => {
    expect(shiftMonthParam("2026-01", 1)).toBe("2026-02");
    expect(shiftMonthParam("2026-01", -1)).toBe("2025-12");
  });
});

describe("formatMonthLabel", () => {
  it("formata com primeira letra maiúscula em pt-BR", () => {
    expect(formatMonthLabel("2026-03")).toMatch(/^Março 2026$/);
  });
});
