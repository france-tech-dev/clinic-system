import { resolveBillingAccess } from "@/shared/constants/billing-plans";
import { BillingPlan, BillingStatus } from "@prisma/enums";
import { describe, expect, it } from "vitest";

describe("resolveBillingAccess", () => {
  it("sem linha de billing trata como legado com tudo libertado", () => {
    const access = resolveBillingAccess(null);
    expect(access.isLegacy).toBe(true);
    expect(access.mode).toBe("full");
    expect(access.maxProfessionals).toBeNull();
  });

  it("trial ignora plano e limite de profissionais", () => {
    const access = resolveBillingAccess({
      status: BillingStatus.TRIALING,
      plan: BillingPlan.SOLO,
      trialEndsAt: new Date("2026-08-18"),
    });
    expect(access.mode).toBe("full");
    expect(access.maxProfessionals).toBeNull();
  });

  it("Solo activo limita a 1 profissional sem extras", () => {
    const access = resolveBillingAccess({
      status: BillingStatus.ACTIVE,
      plan: BillingPlan.SOLO,
      trialEndsAt: null,
      extraSeats: 5,
    });
    expect(access.mode).toBe("full");
    expect(access.maxProfessionals).toBe(1);
    expect(access.extraSeats).toBe(0);
  });

  it("Professional activo limita a 3 sem extras", () => {
    const access = resolveBillingAccess({
      status: BillingStatus.ACTIVE,
      plan: BillingPlan.PRO,
      trialEndsAt: null,
      extraSeats: 2,
    });
    expect(access.maxProfessionals).toBe(3);
    expect(access.extraSeats).toBe(0);
  });

  it("Enterprise activo inclui 9 + extras", () => {
    const access = resolveBillingAccess({
      status: BillingStatus.ACTIVE,
      plan: BillingPlan.ENTERPRISE,
      trialEndsAt: null,
      extraSeats: 1,
    });
    expect(access.maxProfessionals).toBe(10);
    expect(access.extraSeats).toBe(1);
  });

  it("CANCELLED fica read-only", () => {
    const access = resolveBillingAccess({
      status: BillingStatus.CANCELLED,
      plan: null,
      trialEndsAt: new Date("2026-08-11"),
    });
    expect(access.mode).toBe("read_only");
  });
});
