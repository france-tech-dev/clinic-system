import "server-only";

import { BillingStatus } from "@prisma/enums";
import {
  TRIAL_DAYS,
  type BillingAccess,
} from "@/shared/constants/billing-plans";
import { AI_LIMITS, type AiTrialQuotaDTO } from "@/shared/constants/ai-limits";
import { countAiGenerationsSince } from "@/shared/lib/ai/audit";
import { buildTrialAiQuota } from "@/shared/lib/ai/_lib/quota";
import { assertRateLimit } from "@/shared/lib/rate-limit";

const TRIAL_MS = TRIAL_DAYS * 24 * 60 * 60 * 1000;

export class AiGenerationLimitError extends Error {
  readonly retryAfterSec: number | null;

  constructor(message: string, retryAfterSec: number | null = null) {
    super(message);
    this.name = "AiGenerationLimitError";
    this.retryAfterSec = retryAfterSec;
  }
}

function getTrialPeriodStart(trialEndsAt: Date | null, now = Date.now()): Date {
  if (trialEndsAt) {
    return new Date(trialEndsAt.getTime() - TRIAL_MS);
  }
  return new Date(now - TRIAL_MS);
}

function isTrialBilling(billing: BillingAccess): boolean {
  return billing.status === BillingStatus.TRIALING;
}

async function countTrialUsage(opts: {
  organizationId: string;
  userId: string;
  trialEndsAt: Date | null;
}) {
  const since = getTrialPeriodStart(opts.trialEndsAt);
  return Promise.all([
    countAiGenerationsSince({ organizationId: opts.organizationId, since }),
    countAiGenerationsSince({
      organizationId: opts.organizationId,
      userId: opts.userId,
      since,
    }),
  ]);
}

async function assertTrialAiLimits(opts: {
  organizationId: string;
  userId: string;
  trialEndsAt: Date | null;
}): Promise<void> {
  const [orgUsed, userUsed] = await countTrialUsage(opts);
  const { trial } = AI_LIMITS;

  if (orgUsed >= trial.orgMax) {
    throw new AiGenerationLimitError(
      `Limite de gerações da clínica no período de teste atingido (${trial.orgMax}). Assine o plano Enterprise para continuar.`,
    );
  }
  if (userUsed >= trial.userMax) {
    throw new AiGenerationLimitError(
      `Limite pessoal de gerações no período de teste atingido (${trial.userMax}).`,
    );
  }
}

async function assertPaidAiLimits(opts: {
  organizationId: string;
  userId: string;
}): Promise<void> {
  const { paid } = AI_LIMITS;

  const orgLimit = await assertRateLimit({
    key: `ai:org:${opts.organizationId}`,
    windowSec: paid.windowSec,
    max: paid.orgMax,
  });
  if (!orgLimit.ok) {
    throw new AiGenerationLimitError(
      `Limite de gerações da clínica atingido. Tente novamente em cerca de ${orgLimit.retryAfterSec}s.`,
      orgLimit.retryAfterSec,
    );
  }

  const userLimit = await assertRateLimit({
    key: `ai:user:${opts.userId}`,
    windowSec: paid.windowSec,
    max: paid.userMax,
  });
  if (!userLimit.ok) {
    throw new AiGenerationLimitError(
      `Limite de gerações da sua conta atingido. Tente novamente em cerca de ${userLimit.retryAfterSec}s.`,
      userLimit.retryAfterSec,
    );
  }
}

export async function assertAiGenerationAllowed(opts: {
  organizationId: string;
  userId: string;
  billing: BillingAccess;
}): Promise<void> {
  if (isTrialBilling(opts.billing)) {
    await assertTrialAiLimits({
      organizationId: opts.organizationId,
      userId: opts.userId,
      trialEndsAt: opts.billing.trialEndsAt,
    });
    return;
  }

  await assertPaidAiLimits(opts);
}

/** Quota para o UI — só no período de teste; plano pago não expõe contador. */
export async function getAiTrialQuota(opts: {
  organizationId: string;
  userId: string;
  billing: BillingAccess;
}): Promise<AiTrialQuotaDTO | null> {
  if (opts.billing.mode !== "full" || !opts.billing.features.includes("ai")) {
    return null;
  }
  if (!isTrialBilling(opts.billing)) return null;

  const [orgUsed, userUsed] = await countTrialUsage({
    organizationId: opts.organizationId,
    userId: opts.userId,
    trialEndsAt: opts.billing.trialEndsAt,
  });

  return buildTrialAiQuota(orgUsed, userUsed);
}
