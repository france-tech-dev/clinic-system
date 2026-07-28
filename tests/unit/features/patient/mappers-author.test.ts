import { describe, expect, it } from "vitest";
import {
  toClinicalEvaluationDTO,
  toSessionDTO,
} from "@/features/patient/_lib/mappers";

describe("patient mappers — autoria", () => {
  it("toClinicalEvaluationDTO inclui professionalName do member", () => {
    const dto = toClinicalEvaluationDTO({
      id: "e1",
      patientId: "p1",
      memberId: "m1",
      type: "initial",
      date: "2026-07-14",
      complaint: "",
      history: "",
      domains: "[]",
      goals: "",
      interventions: "",
      diagnosis: "",
      referredBy: "",
      familyContext: "",
      previousLevel: "",
      medications: "",
      precautions: "",
      equipment: "",
      frequency: "",
      dischargeCriteria: "",
      createdAt: new Date("2026-07-01T12:00:00Z"),
      updatedAt: new Date("2026-07-01T12:00:00Z"),
      member: {
        metadata: JSON.stringify({
          professional: { name: "", registration: "CREFITO-3 99" },
        }),
        user: { name: "Dra. Silva" },
      },
    });

    expect(dto.memberId).toBe("m1");
    expect(dto.professionalName).toBe("Dra. Silva");
    expect(dto.authorProfessional).toEqual({
      name: "Dra. Silva",
      registration: "CREFITO-3 99",
      clinic: "",
    });
  });

  it("toSessionDTO tolera ausência de member", () => {
    const dto = toSessionDTO({
      id: "s1",
      patientId: "p1",
      appointmentId: "a1",
      memberId: null,
      date: "2026-07-14",
      time: "09:00",
      status: "attended",
      activities: "jogo",
      observations: "",
      createdAt: new Date("2026-07-01T12:00:00Z"),
      updatedAt: new Date("2026-07-01T12:00:00Z"),
      member: null,
    });

    expect(dto.memberId).toBeNull();
    expect(dto.professionalName).toBeNull();
    expect(dto.time).toBe("09:00");
    expect(dto.appointmentId).toBe("a1");
  });
});
