import { describe, expect, it } from "vitest";
import {
  memberToProfessionalProfile,
  parseMemberProfessionalMetadata,
  resolveReportProfessional,
  serializeMemberProfessionalMetadata,
} from "@/shared/types/professional";

describe("professional helpers — multi-CREFITO", () => {
  it("parseMemberProfessionalMetadata lê professional aninhado", () => {
    const raw = JSON.stringify({
      other: 1,
      professional: { nome: "Ana", registro: "CREFITO-3 1" },
    });
    expect(parseMemberProfessionalMetadata(raw)).toEqual({
      nome: "Ana",
      registro: "CREFITO-3 1",
    });
  });

  it("serializeMemberProfessionalMetadata preserva chaves existentes", () => {
    const next = serializeMemberProfessionalMetadata(
      { nome: " Ana ", registro: " R1 " },
      JSON.stringify({ teams: ["a"] }),
    );
    expect(JSON.parse(next)).toEqual({
      teams: ["a"],
      professional: { nome: "Ana", registro: "R1" },
    });
  });

  it("memberToProfessionalProfile usa nome do user como fallback", () => {
    const profile = memberToProfessionalProfile(
      JSON.stringify({ professional: { nome: "", registro: "X" } }),
      "Dra. User",
    );
    expect(profile).toEqual({
      nome: "Dra. User",
      registro: "X",
      clinica: "",
    });
  });

  it("resolveReportProfessional cai no fallback da org", () => {
    const org = { nome: "Org", registro: "ORG", clinica: "Clínica" };
    expect(resolveReportProfessional(null, org)).toEqual(org);
    expect(
      resolveReportProfessional(
        { nome: "Autor", registro: "", clinica: "" },
        org,
      ),
    ).toEqual({
      nome: "Autor",
      registro: "ORG",
      clinica: "Clínica",
    });
  });
});
