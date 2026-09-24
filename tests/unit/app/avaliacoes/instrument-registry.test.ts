import { describe, expect, it, vi } from "vitest";

// O registry puxa `render` → clients → actions/service → auth/prisma/env.
vi.mock("server-only", () => ({}));
vi.mock("@/domains/protocol/protocol.service", () => ({
  listProtocolAssessments: vi.fn(),
}));
vi.mock("@/features/protocol/instruments/_shared/item-protocol-client", () => ({
  ItemProtocolClient: () => null,
}));
vi.mock(
  "@/features/protocol/instruments/fisioterapia/gmfm-88/components/protocol-client",
  () => ({ GmfmProtocolClient: () => null }),
);

import { PROFESSION_INSTRUMENT_CATALOG } from "@/domains/protocol/instruments";
import {
  PROTOCOL_INSTRUMENT_MODULE_REGISTRY,
  getProtocolInstrumentModule,
} from "@/features/protocol/instruments";

const ALL_UI_MODULES = [...PROTOCOL_INSTRUMENT_MODULE_REGISTRY.values()];

describe("instrument catalog ↔ UI registry", () => {
  it("every catalog assessment id has a registered UI module", () => {
    const catalogIds = PROFESSION_INSTRUMENT_CATALOG.flatMap((item) =>
      item.assessments.map((a) => a.id),
    );

    expect(catalogIds.length).toBeGreaterThan(0);

    for (const id of catalogIds) {
      expect(
        getProtocolInstrumentModule(id),
        `Missing UI registry entry for catalog id "${id}"`,
      ).toBeDefined();
    }
  });

  it("every registered UI id appears in the catalog under the same profession", () => {
    for (const mod of ALL_UI_MODULES) {
      const profession = PROFESSION_INSTRUMENT_CATALOG.find(
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
    const to = PROFESSION_INSTRUMENT_CATALOG.find(
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
