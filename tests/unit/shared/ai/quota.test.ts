import { AI_LIMITS } from "@/shared/constants/ai-limits";
import {
  buildTrialAiQuota,
  consumeTrialAiQuota,
  formatTrialAiQuotaHint,
} from "@/shared/lib/ai/_lib/quota";
import { describe, expect, it } from "vitest";

describe("buildTrialAiQuota", () => {
  it("calcula remaining e canGenerate", () => {
    const quota = buildTrialAiQuota(2, 2);

    expect(quota.org).toEqual({
      used: 2,
      max: AI_LIMITS.trial.orgMax,
      remaining: AI_LIMITS.trial.orgMax - 2,
    });
    expect(quota.user.remaining).toBe(AI_LIMITS.trial.userMax - 2);
    expect(quota.canGenerate).toBe(true);
  });

  it("bloqueia quando org atinge o máximo", () => {
    const quota = buildTrialAiQuota(AI_LIMITS.trial.orgMax, 0);
    expect(quota.canGenerate).toBe(false);
  });
});

describe("consumeTrialAiQuota", () => {
  it("decrementa quota após geração", () => {
    const before = buildTrialAiQuota(1, 1);
    const after = consumeTrialAiQuota(before);

    expect(after.org.used).toBe(2);
    expect(after.org.remaining).toBe(AI_LIMITS.trial.orgMax - 2);
    expect(after.user.used).toBe(2);
  });
});

describe("formatTrialAiQuotaHint", () => {
  it("formata singular e plural", () => {
    const almostFull = buildTrialAiQuota(AI_LIMITS.trial.orgMax - 1, 0);
    expect(formatTrialAiQuotaHint(almostFull)).toContain("1 geração restante");

    const plenty = buildTrialAiQuota(0, 0);
    expect(formatTrialAiQuotaHint(plenty)).toContain("5 gerações restantes");
  });
});
