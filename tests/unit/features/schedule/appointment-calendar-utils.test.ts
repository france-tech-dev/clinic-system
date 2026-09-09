import {
  appointmentDateTime,
  appointmentDisplayColor,
  calendarEventStyle,
} from "@/domains/schedule/_lib/appointment-calendar-utils";
import {
  APPOINTMENT_WITH_EVOLUTION_COLOR,
  appointmentStatusInfo,
} from "@/shared/constants/appointment";
import {
  formatAppZonedDateParam,
  formatAppZonedTimeParam,
} from "@/shared/lib/timezone-utils";
import { AppointmentStatus } from "@prisma/enums";
import { describe, expect, it } from "vitest";

describe("appointmentDateTime", () => {
  it("combina data e hora no fuso da app (não como UTC do servidor)", () => {
    const dt = appointmentDateTime("2026-07-13", "14:30");
    // 14:30 America/Sao_Paulo = 17:30 UTC (sem DST)
    expect(dt.toISOString()).toBe("2026-07-13T17:30:00.000Z");
    expect(formatAppZonedDateParam(dt)).toBe("2026-07-13");
    expect(formatAppZonedTimeParam(dt)).toBe("14:30");
  });

  it("12:00 na app não vira 09:00 em UTC (bug de prod)", () => {
    const dt = appointmentDateTime("2026-09-07", "12:00");
    expect(dt.toISOString()).toBe("2026-09-07T15:00:00.000Z");
    expect(formatAppZonedTimeParam(dt)).toBe("12:00");
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
