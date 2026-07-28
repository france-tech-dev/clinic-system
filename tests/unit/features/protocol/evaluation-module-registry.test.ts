import { describe, expect, it } from "vitest";
import { resolveEvaluationModuleUI } from "@/app/(authenticated)/avaliacoes/_lib/resolve-evaluation-module-ui";
import {
  EVALUATION_MODULE_UI_REGISTRY,
  PROFESSION_EVALUATION_CATALOG,
} from "@/features/protocol/evaluation-modules";
import { roteiroEvaluationModuleUIs } from "@/features/patient/roteiro-evaluation-module-ui";

const ALL_UI_MODULES = [
  ...EVALUATION_MODULE_UI_REGISTRY.values(),
  ...roteiroEvaluationModuleUIs,
];

describe("assessment catalog ↔ UI registry", () => {
  it("every catalog assessment id has a registered UI module", () => {
    const catalogIds = PROFESSION_EVALUATION_CATALOG.flatMap((item) =>
      item.assessments.map((a) => a.id),
    );

    for (const id of catalogIds) {
      expect(
        resolveEvaluationModuleUI(id),
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
});
