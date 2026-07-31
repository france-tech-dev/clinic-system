import { describe, expect, it } from "vitest";
import { buildCashDraftFromAppointment } from "@/app/(authenticated)/agenda/_components/hooks/use-agenda-cashflow";
import type { AppointmentDTO } from "@/features/schedule/schedule.types";

const appointment: AppointmentDTO = {
  id: "a1",
  patientId: "p1",
  patientName: "Ana Silva",
  memberId: "m1",
  professionalName: "Dra. Silva",
  date: "2026-07-13",
  time: "10:00",
  duration: 50,
  notes: "",
  status: "completed",
  hasSessionNote: true,
  patientPricingType: "session",
  patientPrice: 180,
  createdAt: "2026-07-01T12:00:00.000Z",
  updatedAt: "2026-07-13T12:00:00.000Z",
};

describe("buildCashDraftFromAppointment", () => {
  it("monta rascunho de entrada com dados do agendamento", () => {
    expect(buildCashDraftFromAppointment(appointment)).toEqual({
      type: "income",
      date: "2026-07-13",
      patientId: "p1",
      memberId: "m1",
      description: "Sessão — Ana Silva",
      amount: 180,
    });
  });
});
