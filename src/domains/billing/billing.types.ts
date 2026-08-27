import type { BillingAccessMode } from "@/shared/constants/billing-plans";
import type {
  BillingPlan,
  BillingStatus,
} from "@prisma/enums";

export type BillingSnapshotDTO = {
  mode: BillingAccessMode;
  status: BillingStatus | null;
  plan: BillingPlan | null;
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
