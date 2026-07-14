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

  it("parsePatientPriceInput converte BRL para centavos", () => {
    expect(parsePatientPriceInput("150,00")).toBe(15000);
  });

  it("formatPatientPriceInput formata centavos", () => {
    expect(formatPatientPriceInput(null)).toBe("");
    expect(formatPatientPriceInput(0)).toBe("");
    expect(formatPatientPriceInput(15000)).toBe("150,00");
  });
});
