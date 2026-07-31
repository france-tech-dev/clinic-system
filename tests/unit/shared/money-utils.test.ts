import { describe, expect, it } from "vitest";
import {
  amountToBrlInput,
  formatBrl,
  parseBrl,
} from "@/shared/lib/money-utils";

describe("parseBrl", () => {
  it("parseia vírgula decimal", () => {
    expect(parseBrl("150,50")).toBe(150.5);
  });

  it("parseia com R$ e milhar", () => {
    expect(parseBrl("R$ 1.250,00")).toBe(1250);
  });

  it("rejeita vazio, inválido e zero", () => {
    expect(parseBrl("")).toBeNull();
    expect(parseBrl("abc")).toBeNull();
    expect(parseBrl("0")).toBeNull();
  });
});

describe("amountToBrlInput", () => {
  it("formata para input pt-BR", () => {
    expect(amountToBrlInput(150.5)).toBe("150,50");
  });
});

describe("formatBrl", () => {
  it("formata como moeda BRL", () => {
    expect(formatBrl(150.5)).toContain("150,50");
  });
});
