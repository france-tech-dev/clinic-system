import {
  bandFromTScore,
  scoreSpm,
} from "@/domains/protocol/instruments/terapia-ocupacional/_lib/spm/score";
import {
  SPM_CASA_5ANOS_GOLDEN,
  SPM_CASA_5ANOS_NORMS,
} from "@/domains/protocol/instruments/terapia-ocupacional/spm-casa-5anos/norms";
import { SPM_CASA_5ANOS_TEMPLATE } from "@/domains/protocol/instruments/terapia-ocupacional/spm-casa-5anos/template";
import { describe, expect, it } from "vitest";

describe("bandFromTScore", () => {
  it("usa limiares do AutoScore legado", () => {
    expect(bandFromTScore(59)).toBe("typical");
    expect(bandFromTScore(60)).toBe("some_problems");
    expect(bandFromTScore(69)).toBe("some_problems");
    expect(bandFromTScore(70)).toBe("definite_dysfunction");
  });
});

describe("SPM_CASA_5ANOS_NORMS", () => {
  it("bate o exemplo do PDF (raw → T)", () => {
    for (const code of Object.keys(SPM_CASA_5ANOS_GOLDEN.raw) as Array<
      keyof typeof SPM_CASA_5ANOS_GOLDEN.raw
    >) {
      const raw = SPM_CASA_5ANOS_GOLDEN.raw[code];
      const expected = SPM_CASA_5ANOS_GOLDEN.tScore[code];
      expect(SPM_CASA_5ANOS_NORMS[code].get(raw)?.tScore).toBe(expected);
    }
  });
});

describe("scoreSpm", () => {
  it("reverte SOC (N→4) e item de bom equilíbrio", () => {
    const summary = scoreSpm(
      SPM_CASA_5ANOS_TEMPLATE,
      {
        "participacao-social-01": "N",
        "equilibrio-e-movimento-02": "S",
      },
      null,
    );

    const soc = summary.scales.find((s) => s.code === "SOC")!;
    const bal = summary.scales.find((s) => s.code === "BAL")!;
    expect(soc.raw).toBe(4);
    expect(bal.raw).toBe(1);
  });

  it("TOT = VIS+HEA+TOU+TAS+BOD+BAL (sem SOC/PLA)", () => {
    const scores: Record<string, string> = {};
    for (const section of SPM_CASA_5ANOS_TEMPLATE.sections) {
      for (const item of section.items) {
        scores[item.id] = "N";
      }
    }
    const summary = scoreSpm(SPM_CASA_5ANOS_TEMPLATE, scores, null);
    const byCode = Object.fromEntries(
      summary.scales.map((s) => [s.code, s.raw]),
    );
    expect(byCode.TOT).toBe(
      byCode.VIS +
        byCode.HEA +
        byCode.TOU +
        byCode.TAS +
        byCode.BOD +
        byCode.BAL,
    );
  });
});
