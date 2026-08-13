import { describe, expect, it } from "vitest";
import { resolveBillingAccess } from "@/shared/constants/billing-plans";

describe("resolveBillingAccess", () => {
  it("sem linha de billing trata como legado com tudo libertado", () => {
    const access = resolveBillingAccess(null);
    expect(access.isLegacy).toBe(true);
    expect(access.mode).toBe("full");
    expect(access.features).toContain("avaliacoes");
    expect(access.maxProfessionals).toBeNull();
  });

  it("trial ignora plano e limite de profissionais", () => {
    const access = resolveBillingAccess({
      status: "trialing",
      plan: "starter",
      trialEndsAt: new Date("2026-08-18"),
    });
    expect(access.mode).toBe("full");
    expect(access.maxProfessionals).toBeNull();
    expect(access.features).toEqual(
      expect.arrayContaining(["anamnese", "portal"]),
    );
  });

  it("Starter activo bloqueia anamnese e caixa", () => {
    const access = resolveBillingAccess({
      status: "active",
      plan: "starter",
      trialEndsAt: null,
    });
    expect(access.mode).toBe("full");
    expect(access.maxProfessionals).toBe(3);
    expect(access.features).toEqual([]);
  });

  it("Pro activo inclui anamnese e caixa, sem avaliações", () => {
    const access = resolveBillingAccess({
      status: "active",
      plan: "pro",
      trialEndsAt: null,
    });
    expect(access.features).toEqual(["anamnese", "caixa"]);
    expect(access.maxProfessionals).toBe(9);
  });

  it("canceled fica read-only", () => {
    const access = resolveBillingAccess({
      status: "canceled",
      plan: null,
      trialEndsAt: new Date("2026-08-11"),
    });
    expect(access.mode).toBe("read_only");
  });
});
