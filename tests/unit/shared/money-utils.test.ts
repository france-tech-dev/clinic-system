import { describe, expect, it } from "vitest";
import {
  centsToBrlInput,
  formatCentsToBrl,
  parseBrlToCents,
} from "@/shared/lib/money-utils";

describe("parseBrlToCents", () => {
  it("converte valor com vírgula", () => {
    expect(parseBrlToCents("150,50")).toBe(15050);
  });

  it("aceita prefixo R$ e separador de milhar", () => {
    expect(parseBrlToCents("R$ 1.250,00")).toBe(125000);
  });

  it("retorna null para vazio ou inválido", () => {
    expect(parseBrlToCents("")).toBeNull();
    expect(parseBrlToCents("abc")).toBeNull();
    expect(parseBrlToCents("0")).toBeNull();
  });
});

describe("centsToBrlInput", () => {
  it("formata centavos para input brasileiro", () => {
    expect(centsToBrlInput(15050)).toBe("150,50");
  });
});

describe("formatCentsToBrl", () => {
  it("formata moeda pt-BR", () => {
    expect(formatCentsToBrl(15050)).toContain("150,50");
  });
});
