import type { BillingAccessMode } from "@/shared/constants/billing-plans";
import type { BillingPlan, BillingStatus } from "@prisma/enums";

export type BillingSnapshotDTO = {
  mode: BillingAccessMode;
  status: BillingStatus | null;
  plan: BillingPlan | null;
  trialEndsAt: string | null;
  isLegacy: boolean;
  billingExempt: boolean;
  canManageBilling: boolean;
  maxProfessionals: number | null;
  extraSeats: number;
};

export type CheckoutSessionDTO = {
  url: string;
};
