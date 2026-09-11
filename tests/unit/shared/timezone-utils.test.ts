import {
  buildAppZonedDateTime,
  formatAppZonedDateParam,
  formatAppZonedTimeParam,
} from "@/shared/lib/timezone-utils";
import { describe, expect, it } from "vitest";

describe("buildAppZonedDateTime", () => {
  it("12:00 em São Paulo é 15:00Z, não 12:00Z (host UTC)", () => {
    const dt = buildAppZonedDateTime("2026-09-07", "12:00");
    expect(dt.toISOString()).toBe("2026-09-07T15:00:00.000Z");
    expect(formatAppZonedDateParam(dt)).toBe("2026-09-07");
    expect(formatAppZonedTimeParam(dt)).toBe("12:00");
  });

  it("14:30 em São Paulo (sem DST) é 17:30Z", () => {
    const dt = buildAppZonedDateTime("2026-07-13", "14:30");
    expect(dt.toISOString()).toBe("2026-07-13T17:30:00.000Z");
    expect(formatAppZonedTimeParam(dt)).toBe("14:30");
  });
});
