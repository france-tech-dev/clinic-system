import { AppError } from "@/shared/lib/app-error";
import { Prisma } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

const nameSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
});

describe("AppError", () => {
  it("result preserva mensagem e fieldErrors", () => {
    const err = new AppError("Campo inválido", {
      fieldErrors: { amount: "Informe um valor" },
    });
    expect(err.result()).toEqual({
      success: false,
      message: "Campo inválido",
      fieldErrors: { amount: "Informe um valor" },
    });
  });

  it("parse devolve dados válidos", () => {
    expect(AppError.parse(nameSchema, { name: "Ana" })).toEqual({
      name: "Ana",
    });
  });

  it("parse lança AppError com fieldErrors", () => {
    expect(() => AppError.parse(nameSchema, { name: "" })).toThrow(AppError);
    try {
      AppError.parse(nameSchema, { name: "" });
    } catch (e) {
      expect((e as AppError).result()).toEqual({
        success: false,
        message: "Nome obrigatório",
        fieldErrors: { name: "Nome obrigatório" },
      });
    }
  });

  it("result estático repassa AppError", () => {
    expect(AppError.result(new AppError("Sem organização."))).toEqual({
      success: false,
      message: "Sem organização.",
    });
  });

  it("result estático não vaza dump do Prisma", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const err = new Prisma.PrismaClientValidationError(
      "Invalid `prisma.cashTransaction.create()` invocation:\nUnknown argument `status`.",
      { clientVersion: "7.10.0" },
    );
    expect(AppError.result(err, "Falha no caixa.")).toEqual({
      success: false,
      message: "Falha no caixa.",
    });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
