import { describe, expect, it, vi } from "vitest";

// O registry puxa `render` → actions → auth → email (`server-only`).
vi.mock("server-only", () => ({}));

import { PROFESSION_EVALUATION_CATALOG } from "@/domains/protocol/evaluation-modules";
import {
  EVALUATION_MODULE_REGISTRY,
  getEvaluationModule,
} from "@/features/protocol/evaluation-modules";

const ALL_UI_MODULES = [...EVALUATION_MODULE_REGISTRY.values()];

describe("assessment catalog ↔ UI registry", () => {
  it("every catalog assessment id has a registered UI module", () => {
    const catalogIds = PROFESSION_EVALUATION_CATALOG.flatMap((item) =>
      item.assessments.map((a) => a.id),
    );

    expect(catalogIds.length).toBeGreaterThan(0);

    for (const id of catalogIds) {
      expect(
        getEvaluationModule(id),
        `Missing UI registry entry for catalog id "${id}"`,
      ).toBeDefined();
    }
  });

  it("every registered UI id appears in the catalog under the same profession", () => {
    for (const mod of ALL_UI_MODULES) {
      const profession = PROFESSION_EVALUATION_CATALOG.find(
        (item) => item.professionId === mod.professionId,
      );
      expect(
        profession,
        `Profession "${mod.professionId}" missing from catalog for UI "${mod.id}"`,
      ).toBeDefined();
      expect(
        profession?.assessments.some((a) => a.id === mod.id),
        `Registry id "${mod.id}" is not listed under "${mod.professionId}" in the hub catalog`,
      ).toBe(true);
    }
  });

  it("lists TO instruments (PEDI + SPM) in the hub catalog", () => {
    const to = PROFESSION_EVALUATION_CATALOG.find(
      (item) => item.professionId === "terapeuta_ocupacional",
    );
    expect(to).toBeDefined();
    const ids = to?.assessments.map((a) => a.id) ?? [];
    expect(ids).toEqual(
      expect.arrayContaining([
        "pedi-autocuidado",
        "pedi-funcao-social",
        "pedi-mobilidade",
        "spm-casa-2anos",
        "spm-casa-3anos",
        "spm-casa-5anos",
      ]),
    );
    expect(ids.length).toBeGreaterThanOrEqual(6);
  });
});
