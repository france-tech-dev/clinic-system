import { describe, expect, it } from "vitest";
import { filterAppointmentsByMemberId } from "@/features/schedule/_lib/filter-appointments-by-member";

describe("filterAppointmentsByMemberId", () => {
  const items = [
    { id: "1", memberId: "m-a" },
    { id: "2", memberId: "m-b" },
    { id: "3", memberId: "m-a" },
  ];

  it("devolve todos quando memberId é all, null ou vazio", () => {
    expect(filterAppointmentsByMemberId(items, "all")).toEqual(items);
    expect(filterAppointmentsByMemberId(items, null)).toEqual(items);
    expect(filterAppointmentsByMemberId(items, "")).toEqual(items);
    expect(filterAppointmentsByMemberId(items, "  ")).toEqual(items);
  });

  it("filtra pelo memberId indicado", () => {
    expect(filterAppointmentsByMemberId(items, "m-a")).toEqual([
      { id: "1", memberId: "m-a" },
      { id: "3", memberId: "m-a" },
    ]);
    expect(filterAppointmentsByMemberId(items, "m-b")).toEqual([
      { id: "2", memberId: "m-b" },
    ]);
  });

  it("devolve lista vazia quando nenhum coincide", () => {
    expect(filterAppointmentsByMemberId(items, "m-x")).toEqual([]);
  });
});
