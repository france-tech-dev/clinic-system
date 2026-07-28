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
      professional: { name: "Ana", registration: "CREFITO-3 1" },
    });
    expect(parseMemberProfessionalMetadata(raw)).toEqual({
      name: "Ana",
      registration: "CREFITO-3 1",
    });
  });

  it("serializeMemberProfessionalMetadata preserva chaves existentes", () => {
    const next = serializeMemberProfessionalMetadata(
      { name: " Ana ", registration: " R1 " },
      JSON.stringify({ teams: ["a"] }),
    );
    expect(JSON.parse(next)).toEqual({
      teams: ["a"],
      professional: { name: "Ana", registration: "R1" },
    });
  });

  it("memberToProfessionalProfile usa name do user como fallback", () => {
    const profile = memberToProfessionalProfile(
      JSON.stringify({ professional: { name: "", registration: "X" } }),
      "Dra. User",
    );
    expect(profile).toEqual({
      name: "Dra. User",
      registration: "X",
      clinic: "",
    });
  });

  it("resolveReportProfessional cai no fallback da org", () => {
    const org = { name: "Org", registration: "ORG", clinic: "Clínica" };
    expect(resolveReportProfessional(null, org)).toEqual(org);
    expect(
      resolveReportProfessional(
        { name: "Autor", registration: "", clinic: "" },
        org,
      ),
    ).toEqual({
      name: "Autor",
      registration: "ORG",
      clinic: "Clínica",
    });
  });
});
