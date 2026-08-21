import { beforeEach, describe, expect, it, vi } from "vitest";
import { Decimal } from "@prisma/client/runtime/client";
import { scheduleRepository } from "@/features/schedule/schedule.repository";
import { rescheduleAppointment } from "@/features/schedule/schedule.service";

vi.mock("@/features/schedule/schedule.repository", () => ({
  scheduleRepository: {
    findById: vi.fn(),
    reschedule: vi.fn(),
    findSessionNoteAppointmentIdsInRange: vi.fn(),
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
  status: "SCHEDULED" as const,
  createdAt: new Date("2026-07-01T12:00:00"),
  updatedAt: new Date("2026-07-01T12:00:00"),
  patient: {
    id: "patient-1",
    name: "Ana",
    pricingType: "SESSION" as const,
    price: new Decimal(150),
  },
  member: {
    id: "member-1",
    organizationId: orgId,
    userId: "user-1",
    role: "OWNER" as const,
    status: "ACTIVE" as const,
    profession: null,
    registration: null,
    metadata: null,
    createdAt: new Date("2026-07-01T12:00:00"),
    user: { name: "Dra. Silva" },
  },
};

describe("rescheduleAppointment", () => {
  beforeEach(() => {
    vi.mocked(scheduleRepository.findById).mockReset();
    vi.mocked(scheduleRepository.reschedule).mockReset();
    vi.mocked(
      scheduleRepository.findSessionNoteAppointmentIdsInRange,
    ).mockResolvedValue(new Set());
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
      status: "COMPLETED",
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
