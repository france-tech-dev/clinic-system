import type {
  BillingAccessMode,
  BillingPlanId,
  BillingStatusId,
} from "@/shared/constants/billing-plans";

export type BillingSnapshotDTO = {
  mode: BillingAccessMode;
  status: BillingStatusId | null;
  plan: BillingPlanId | null;
  trialEndsAt: string | null;
  isLegacy: boolean;
  billingExempt: boolean;
  /** Tem Customer Stripe — pode abrir o Customer Portal. */
  canManageBilling: boolean;
  maxProfessionals: number | null;
};

export type CheckoutSessionDTO = {
  url: string;
};
