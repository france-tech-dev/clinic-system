export const AI_LIMITS = {
  paid: {
    orgMax: 40,
    userMax: 20,
    windowSec: 60 * 60,
  },
  trial: {
    orgMax: 20,
    userMax: 10,
  },
} as const;

export type AiTrialQuotaDTO = {
  org: { used: number; max: number; remaining: number };
  user: { used: number; max: number; remaining: number };
  canGenerate: boolean;
};
