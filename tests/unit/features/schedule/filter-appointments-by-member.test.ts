import {
  filterAppointmentsByMemberId,
  filterAppointmentsByPatientId,
  filterAppointmentsByStatus,
  normalizeFilterIds,
} from "@/domains/schedule/_lib/filter-appointments-by-member";
import { describe, expect, it } from "vitest";

describe("normalizeFilterIds", () => {
  it("trata all, null e vazio como sem filtro", () => {
    expect(normalizeFilterIds("all")).toEqual([]);
    expect(normalizeFilterIds(null)).toEqual([]);
    expect(normalizeFilterIds("")).toEqual([]);
    expect(normalizeFilterIds("  ")).toEqual([]);
    expect(normalizeFilterIds([])).toEqual([]);
  });

  it("normaliza string e array", () => {
    expect(normalizeFilterIds("m-a")).toEqual(["m-a"]);
    expect(normalizeFilterIds(["m-a", " m-b ", "all", ""])).toEqual([
      "m-a",
      "m-b",
    ]);
  });
});

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
    expect(filterAppointmentsByMemberId(items, [])).toEqual(items);
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

  it("filtra por vários memberIds", () => {
    expect(filterAppointmentsByMemberId(items, ["m-a", "m-b"])).toEqual(items);
    expect(filterAppointmentsByMemberId(items, ["m-b"])).toEqual([
      { id: "2", memberId: "m-b" },
    ]);
  });

  it("devolve lista vazia quando nenhum coincide", () => {
    expect(filterAppointmentsByMemberId(items, "m-x")).toEqual([]);
  });
});

describe("filterAppointmentsByPatientId", () => {
  const items = [
    { id: "1", patientId: "p-a" },
    { id: "2", patientId: "p-b" },
    { id: "3", patientId: "p-a" },
  ];

  it("filtra por um ou vários pacientes", () => {
    expect(filterAppointmentsByPatientId(items, [])).toEqual(items);
    expect(filterAppointmentsByPatientId(items, ["p-a"])).toEqual([
      { id: "1", patientId: "p-a" },
      { id: "3", patientId: "p-a" },
    ]);
    expect(filterAppointmentsByPatientId(items, ["p-a", "p-b"])).toEqual(items);
  });
});

describe("filterAppointmentsByStatus", () => {
  const items = [
    { id: "1", status: "SCHEDULED" },
    { id: "2", status: "COMPLETED" },
    { id: "3", status: "SCHEDULED" },
  ];

  it("filtra por um ou vários status", () => {
    expect(filterAppointmentsByStatus(items, [])).toEqual(items);
    expect(filterAppointmentsByStatus(items, ["SCHEDULED"])).toEqual([
      { id: "1", status: "SCHEDULED" },
      { id: "3", status: "SCHEDULED" },
    ]);
    expect(
      filterAppointmentsByStatus(items, ["SCHEDULED", "COMPLETED"]),
    ).toEqual(items);
  });
});
