import { describe, expect, it } from "vitest";
import {
  APPOINTMENT_WITH_EVOLUTION_COLOR,
  appointmentStatusInfo,
} from "@/shared/constants/appointment";
import {
  appointmentDateTime,
  appointmentDisplayColor,
  calendarEventStyle,
} from "@/features/schedule/_lib/appointment-calendar-utils";
import { AppointmentStatus } from "../../../../prisma/generated/prisma/enums";

describe("appointmentDateTime", () => {
  it("combina data e hora", () => {
    const dt = appointmentDateTime("2026-07-13", "14:30");
    expect(dt.getFullYear()).toBe(2026);
    expect(dt.getMonth()).toBe(6);
    expect(dt.getDate()).toBe(13);
    expect(dt.getHours()).toBe(14);
    expect(dt.getMinutes()).toBe(30);
  });

  it("usa 09:00 quando hora está vazia", () => {
    const dt = appointmentDateTime("2026-07-13", "");
    expect(dt.getHours()).toBe(9);
    expect(dt.getMinutes()).toBe(0);
  });
});

describe("appointmentDisplayColor", () => {
  it("prioriza cor de evolução registada", () => {
    expect(appointmentDisplayColor(AppointmentStatus.SCHEDULED, true)).toBe(
      APPOINTMENT_WITH_EVOLUTION_COLOR,
    );
  });

  it("usa cor do status sem evolução", () => {
    expect(appointmentDisplayColor(AppointmentStatus.COMPLETED, false)).toBe(
      appointmentStatusInfo(AppointmentStatus.COMPLETED).color,
    );
  });
});

describe("calendarEventStyle", () => {
  it("aplica opacidade reduzida para cancelado", () => {
    const style = calendarEventStyle(AppointmentStatus.CANCELLED, false);
    expect(style.opacity).toBe(0.55);
    expect(style.backgroundColor).toBe(
      appointmentStatusInfo(AppointmentStatus.CANCELLED).color,
    );
  });

  it("usa cor de evolução quando há session note", () => {
    const style = calendarEventStyle(AppointmentStatus.SCHEDULED, true);
    expect(style.backgroundColor).toBe(APPOINTMENT_WITH_EVOLUTION_COLOR);
    expect(style.opacity).toBe(1);
  });
});
