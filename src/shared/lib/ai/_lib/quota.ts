import { AI_LIMITS, type AiTrialQuotaDTO } from "@/shared/constants/ai-limits";

export function buildTrialAiQuota(
  orgUsed: number,
  userUsed: number,
): AiTrialQuotaDTO {
  const { trial } = AI_LIMITS;
  const orgRemaining = Math.max(0, trial.orgMax - orgUsed);
  const userRemaining = Math.max(0, trial.userMax - userUsed);

  return {
    org: {
      used: orgUsed,
      max: trial.orgMax,
      remaining: orgRemaining,
    },
    user: {
      used: userUsed,
      max: trial.userMax,
      remaining: userRemaining,
    },
    canGenerate: orgRemaining > 0 && userRemaining > 0,
  };
}

export function consumeTrialAiQuota(quota: AiTrialQuotaDTO): AiTrialQuotaDTO {
  const orgRemaining = Math.max(0, quota.org.remaining - 1);
  const userRemaining = Math.max(0, quota.user.remaining - 1);

  return {
    org: {
      ...quota.org,
      used: quota.org.used + 1,
      remaining: orgRemaining,
    },
    user: {
      ...quota.user,
      used: quota.user.used + 1,
      remaining: userRemaining,
    },
    canGenerate: orgRemaining > 0 && userRemaining > 0,
  };
}

export function formatTrialAiQuotaHint(quota: AiTrialQuotaDTO): string {
  const orgLine =
    quota.org.remaining === 1
      ? "1 geração restante na clínica"
      : `${quota.org.remaining} gerações restantes na clínica`;
  return `Período de teste: ${orgLine} (${quota.org.used} de ${quota.org.max} usadas).`;
}
