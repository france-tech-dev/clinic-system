import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { AI_LIMITS } from "@/shared/constants/ai-limits";
import type { BillingAccess } from "@/shared/constants/billing-plans";
import { countAiGenerationsSince } from "@/shared/lib/ai/audit";
import {
  AiGenerationLimitError,
  assertAiGenerationAllowed,
  getAiTrialQuota,
} from "@/shared/lib/ai/generation-limit";
import { assertRateLimit } from "@/shared/lib/rate-limit";
import { BillingPlan, BillingStatus } from "@prisma/enums";

vi.mock("@/shared/lib/ai/audit", () => ({
  countAiGenerationsSince: vi.fn(),
}));

vi.mock("@/shared/lib/rate-limit", () => ({
  assertRateLimit: vi.fn(),
}));

const orgId = "org-1";
const userId = "user-1";

const trialBilling: BillingAccess = {
  mode: "full",
  status: BillingStatus.TRIALING,
  plan: BillingPlan.SOLO,
  trialEndsAt: new Date("2026-09-08"),
  maxProfessionals: null,
  extraSeats: 0,
  isLegacy: false,
};

const paidBilling: BillingAccess = {
  mode: "full",
  status: BillingStatus.ACTIVE,
  plan: BillingPlan.ENTERPRISE,
  trialEndsAt: null,
  maxProfessionals: 9,
  extraSeats: 0,
  isLegacy: false,
};

describe("assertAiGenerationAllowed", () => {
  beforeEach(() => {
    vi.mocked(countAiGenerationsSince).mockReset();
    vi.mocked(assertRateLimit).mockReset();
    vi.mocked(assertRateLimit).mockResolvedValue({ ok: true });
  });

  it("bloqueia trial quando a clínica atinge o máximo", async () => {
    vi.mocked(countAiGenerationsSince)
      .mockResolvedValueOnce(AI_LIMITS.trial.orgMax)
      .mockResolvedValueOnce(0);

    await expect(
      assertAiGenerationAllowed({
        organizationId: orgId,
        userId,
        billing: trialBilling,
      }),
    ).rejects.toBeInstanceOf(AiGenerationLimitError);

    expect(assertRateLimit).not.toHaveBeenCalled();
  });

  it("bloqueia trial quando o utilizador atinge o máximo", async () => {
    vi.mocked(countAiGenerationsSince)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(AI_LIMITS.trial.userMax);

    await expect(
      assertAiGenerationAllowed({
        organizationId: orgId,
        userId,
        billing: trialBilling,
      }),
    ).rejects.toThrow(/Limite pessoal/);
  });

  it("permite trial abaixo do limite", async () => {
    vi.mocked(countAiGenerationsSince)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    await expect(
      assertAiGenerationAllowed({
        organizationId: orgId,
        userId,
        billing: trialBilling,
      }),
    ).resolves.toBeUndefined();
  });

  it("aplica rate limit horário no plano pago", async () => {
    await assertAiGenerationAllowed({
      organizationId: orgId,
      userId,
      billing: paidBilling,
    });

    expect(countAiGenerationsSince).not.toHaveBeenCalled();
    expect(assertRateLimit).toHaveBeenCalledWith({
      key: `ai:org:${orgId}`,
      windowSec: AI_LIMITS.paid.windowSec,
      max: AI_LIMITS.paid.orgMax,
    });
    expect(assertRateLimit).toHaveBeenCalledWith({
      key: `ai:user:${userId}`,
      windowSec: AI_LIMITS.paid.windowSec,
      max: AI_LIMITS.paid.userMax,
    });
  });

  it("propaga 429 do rate limit horário", async () => {
    vi.mocked(assertRateLimit).mockResolvedValueOnce({
      ok: false,
      retryAfterSec: 120,
    });

    await expect(
      assertAiGenerationAllowed({
        organizationId: orgId,
        userId,
        billing: paidBilling,
      }),
    ).rejects.toMatchObject({ retryAfterSec: 120 });
  });
});

describe("getAiTrialQuota", () => {
  beforeEach(() => {
    vi.mocked(countAiGenerationsSince).mockReset();
  });

  it("devolve null fora do trial", async () => {
    const quota = await getAiTrialQuota({
      organizationId: orgId,
      userId,
      billing: paidBilling,
    });
    expect(quota).toBeNull();
  });

  it("devolve quota com remaining no trial", async () => {
    vi.mocked(countAiGenerationsSince)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const quota = await getAiTrialQuota({
      organizationId: orgId,
      userId,
      billing: trialBilling,
    });

    expect(quota).toEqual({
      org: { used: 0, max: 1, remaining: 1 },
      user: { used: 0, max: 1, remaining: 1 },
      canGenerate: true,
    });
  });
});
