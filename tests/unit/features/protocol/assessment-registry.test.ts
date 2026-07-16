import { describe, expect, it } from "vitest";
import {
  ASSESSMENT_UI_REGISTRY,
  PROFESSION_ASSESSMENT_CATALOG,
} from "@/features/protocol/assessments";

describe("assessment catalog ↔ UI registry", () => {
  it("every catalog assessment id has a registered UI module", () => {
    const catalogIds = PROFESSION_ASSESSMENT_CATALOG.flatMap((item) =>
      item.assessments.map((a) => a.id),
    );

    for (const id of catalogIds) {
      expect(
        ASSESSMENT_UI_REGISTRY.has(id),
        `Missing UI registry entry for catalog id "${id}"`,
      ).toBe(true);
    }
  });

  it("every registered UI id appears in the catalog under the same profession", () => {
    for (const [id, mod] of ASSESSMENT_UI_REGISTRY) {
      const profession = PROFESSION_ASSESSMENT_CATALOG.find(
        (item) => item.professionId === mod.professionId,
      );
      expect(
        profession,
        `Profession "${mod.professionId}" missing from catalog for UI "${id}"`,
      ).toBeDefined();
      expect(
        profession?.assessments.some((a) => a.id === id),
        `Registry id "${id}" is not listed under "${mod.professionId}" in the hub catalog`,
      ).toBe(true);
    }
  });
});
