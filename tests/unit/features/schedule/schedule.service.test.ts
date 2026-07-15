import { beforeEach, describe, expect, it, vi } from "vitest";
import { scheduleRepository } from "@/features/schedule/schedule.repository";
import { rescheduleAppointment } from "@/features/schedule/schedule.service";

vi.mock("@/features/schedule/schedule.repository", () => ({
  scheduleRepository: {
    findById: vi.fn(),
    reschedule: vi.fn(),
    findSessionNoteKeysInRange: vi.fn(),
  },
}));

const orgId = "org-1";
const appointmentId = "appt-1";

const baseRow = {
  id: appointmentId,
  organizationId: orgId,
  patientId: "patient-1",
  memberId: "member-1",
  date: "2026-07-13",
  time: "10:00",
  duration: 50,
  notes: "",
  status: "agendado" as const,
  createdAt: new Date("2026-07-01T12:00:00"),
  updatedAt: new Date("2026-07-01T12:00:00"),
  patient: {
    id: "patient-1",
    name: "Ana",
    pricingType: "sessao" as const,
    priceCents: 15000,
  },
  member: {
    id: "member-1",
    organizationId: orgId,
    userId: "user-1",
    role: "OWNER" as const,
    status: "ativo" as const,
    profession: null,
    registro: null,
    metadata: null,
    createdAt: new Date("2026-07-01T12:00:00"),
    user: { name: "Dra. Silva" },
  },
};

describe("rescheduleAppointment", () => {
  beforeEach(() => {
    vi.mocked(scheduleRepository.findById).mockReset();
    vi.mocked(scheduleRepository.reschedule).mockReset();
    vi.mocked(scheduleRepository.findSessionNoteKeysInRange).mockResolvedValue(
      new Set(),
    );
  });

  it("retorna not_found quando agendamento não existe", async () => {
    vi.mocked(scheduleRepository.findById).mockResolvedValue(null);

    await expect(
      rescheduleAppointment(orgId, appointmentId, "2026-07-14", "11:00"),
    ).resolves.toBe("not_found");
  });

  it("retorna invalid_status quando status não é agendado", async () => {
    vi.mocked(scheduleRepository.findById).mockResolvedValue({
      ...baseRow,
      status: "realizado",
    });

    await expect(
      rescheduleAppointment(orgId, appointmentId, "2026-07-14", "11:00"),
    ).resolves.toBe("invalid_status");
  });

  it("reagenda e retorna DTO quando status é agendado", async () => {
    vi.mocked(scheduleRepository.findById).mockResolvedValue(baseRow);
    vi.mocked(scheduleRepository.reschedule).mockResolvedValue({
      ...baseRow,
      date: "2026-07-14",
      time: "11:00",
    });

    const result = await rescheduleAppointment(
      orgId,
      appointmentId,
      "2026-07-14",
      "11:00",
    );

    expect(result).toMatchObject({
      id: appointmentId,
      date: "2026-07-14",
      time: "11:00",
      patientName: "Ana",
      memberId: "member-1",
      professionalName: "Dra. Silva",
      hasSessionNote: false,
    });
  });

  it("retorna not_found quando reschedule falha após validação", async () => {
    vi.mocked(scheduleRepository.findById).mockResolvedValue(baseRow);
    vi.mocked(scheduleRepository.reschedule).mockResolvedValue(null);

    await expect(
      rescheduleAppointment(orgId, appointmentId, "2026-07-14", "11:00"),
    ).resolves.toBe("not_found");
  });
});
