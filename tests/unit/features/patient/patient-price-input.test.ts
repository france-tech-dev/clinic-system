import { describe, expect, it } from "vitest";
import {
  formatPatientPriceInput,
  parsePatientPriceInput,
} from "@/features/patient/_lib/patient-price-input";

describe("patient-price-input", () => {
  it("parsePatientPriceInput devolve null para vazio", () => {
    expect(parsePatientPriceInput("")).toBeNull();
    expect(parsePatientPriceInput("  ")).toBeNull();
  });

  it("parsePatientPriceInput converte BRL para reais", () => {
    expect(parsePatientPriceInput("150,00")).toBe(150);
  });

  it("formatPatientPriceInput formata reais", () => {
    expect(formatPatientPriceInput(null)).toBe("");
    expect(formatPatientPriceInput(0)).toBe("");
    expect(formatPatientPriceInput(150)).toBe("150,00");
  });
});
