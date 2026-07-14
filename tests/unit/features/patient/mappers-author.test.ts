import { describe, expect, it } from "vitest";
import {
  toEvaluationDTO,
  toSessionDTO,
} from "@/features/patient/_lib/mappers";

describe("patient mappers — autoria", () => {
  it("toEvaluationDTO inclui professionalName do member", () => {
    const dto = toEvaluationDTO({
      id: "e1",
      patientId: "p1",
      memberId: "m1",
      tipo: "inicial",
      date: "2026-07-14",
      queixa: "",
      historia: "",
      domains: "[]",
      objetivos: "",
      condutas: "",
      diagnostico: "",
      encaminhadoPor: "",
      contextoFamiliar: "",
      nivelPrevio: "",
      medicacoes: "",
      precaucoes: "",
      equipamentos: "",
      frequencia: "",
      criteriosAlta: "",
      createdAt: new Date("2026-07-01T12:00:00Z"),
      updatedAt: new Date("2026-07-01T12:00:00Z"),
      member: { user: { name: "Dra. Silva" } },
    });

    expect(dto.memberId).toBe("m1");
    expect(dto.professionalName).toBe("Dra. Silva");
  });

  it("toSessionDTO tolera ausência de member", () => {
    const dto = toSessionDTO({
      id: "s1",
      patientId: "p1",
      memberId: null,
      date: "2026-07-14",
      status: "compareceu",
      atividades: "jogo",
      observacoes: "",
      createdAt: new Date("2026-07-01T12:00:00Z"),
      updatedAt: new Date("2026-07-01T12:00:00Z"),
      member: null,
    });

    expect(dto.memberId).toBeNull();
    expect(dto.professionalName).toBeNull();
  });
});
