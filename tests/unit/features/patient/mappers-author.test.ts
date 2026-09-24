import { toAssessmentDTO } from "@/domains/assessment/_lib/mappers";
import { toEvolutionDTO } from "@/domains/evolution/_lib/mappers";
import { describe, expect, it } from "vitest";

describe("assessment/evolution mappers — autoria", () => {
  it("toAssessmentDTO inclui professionalName do member", () => {
    const dto = toAssessmentDTO({
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

  it("toEvolutionDTO tolera ausência de member", () => {
    const dto = toEvolutionDTO({
      id: "s1",
      patientId: "p1",
      appointmentId: "a1",
      memberId: null,
      date: "2026-07-14",
      time: "09:00",
      status: "ATTENDED",
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
