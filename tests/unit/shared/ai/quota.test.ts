import { AI_LIMITS } from "@/shared/constants/ai-limits";
import {
  buildTrialAiQuota,
  consumeTrialAiQuota,
  formatTrialAiQuotaHint,
} from "@/shared/lib/ai/_lib/quota";
import { describe, expect, it } from "vitest";

describe("buildTrialAiQuota", () => {
  it("calcula remaining e canGenerate", () => {
    const quota = buildTrialAiQuota(0, 0);

    expect(quota.org).toEqual({
      used: 0,
      max: AI_LIMITS.trial.orgMax,
      remaining: AI_LIMITS.trial.orgMax,
    });
    expect(quota.user.remaining).toBe(AI_LIMITS.trial.userMax);
    expect(quota.canGenerate).toBe(true);
  });

  it("bloqueia quando org atinge o máximo", () => {
    const quota = buildTrialAiQuota(AI_LIMITS.trial.orgMax, 0);
    expect(quota.canGenerate).toBe(false);
  });
});

describe("consumeTrialAiQuota", () => {
  it("decrementa quota após geração", () => {
    const before = buildTrialAiQuota(0, 0);
    const after = consumeTrialAiQuota(before);

    expect(after.org.used).toBe(1);
    expect(after.org.remaining).toBe(0);
    expect(after.user.used).toBe(1);
    expect(after.canGenerate).toBe(false);
  });
});

describe("formatTrialAiQuotaHint", () => {
  it("formata singular e plural", () => {
    const oneLeft = buildTrialAiQuota(0, 0);
    expect(formatTrialAiQuotaHint(oneLeft)).toContain("1 geração restante");

    const plural = {
      org: { used: 0, max: 5, remaining: 5 },
      user: { used: 0, max: 5, remaining: 5 },
      canGenerate: true,
    };
    expect(formatTrialAiQuotaHint(plural)).toContain("5 gerações restantes");
  });
});
