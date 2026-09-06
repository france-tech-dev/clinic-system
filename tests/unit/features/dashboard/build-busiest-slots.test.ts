import { buildBusiestSlots } from "@/domains/dashboard/_lib/build-busiest-slots";
import { describe, expect, it } from "vitest";

describe("buildBusiestSlots", () => {
  it("agrega por dia da semana e por hora", () => {
    // 2026-09-01 = terça; 2026-09-04 = sexta
    const result = buildBusiestSlots([
      { date: "2026-09-01", time: "10:00" },
      { date: "2026-09-01", time: "10:30" },
      { date: "2026-09-01", time: "14:00" },
      { date: "2026-09-04", time: "10:00" },
      { date: "2026-09-04", time: "" },
    ]);

    expect(result.total).toBe(5);
    expect(result.weekdays[2]?.count).toBe(3); // terça
    expect(result.weekdays[5]?.count).toBe(2); // sexta

    const row10 = result.hours.find((h) => h.hour === 10);
    expect(row10?.counts[2]).toBe(2);
    expect(row10?.counts[5]).toBe(1);
    expect(result.maxHourCount).toBe(2);
  });

  it("ignora datas inválidas e horas fora da faixa da agenda", () => {
    const result = buildBusiestSlots([
      { date: "bad", time: "10:00" },
      { date: "2026-09-01", time: "06:00" },
      { date: "2026-09-01", time: "21:00" },
      { date: "2026-09-01", time: "09:00" },
    ]);

    expect(result.total).toBe(3);
    expect(result.weekdays[2]?.count).toBe(3);
    const row9 = result.hours.find((h) => h.hour === 9);
    expect(row9?.counts[2]).toBe(1);
    expect(result.maxHourCount).toBe(1);
  });

  it("devolve grelha vazia sem agendamentos", () => {
    const result = buildBusiestSlots([]);
    expect(result.total).toBe(0);
    expect(result.maxHourCount).toBe(0);
    expect(result.weekdays).toHaveLength(7);
    expect(result.hours.every((h) => h.counts.every((c) => c === 0))).toBe(
      true,
    );
  });
});
