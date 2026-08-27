import Stripe from "stripe";
import { env } from "@/shared/env";
import {
  BillingPlan,
  BillingStatus,
} from "@prisma/enums";

let client: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (client !== undefined) return client;
  client = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY) : null;
  return client;
}

export function requireStripe(): Stripe {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY não está configurada.");
  }
  return stripe;
}

const priceByPlan: Record<BillingPlan, string | undefined> = {
  [BillingPlan.STARTER]: env.STRIPE_PRICE_STARTER,
  [BillingPlan.PRO]: env.STRIPE_PRICE_PRO,
  [BillingPlan.ENTERPRISE]: env.STRIPE_PRICE_ENTERPRISE,
};

export function getStripePriceId(plan: BillingPlan): string | null {
  return priceByPlan[plan] ?? null;
}

export function requireStripePriceId(plan: BillingPlan): string {
  const priceId = priceByPlan[plan];
  if (!priceId) {
    throw new Error(`Preço Stripe em falta para o plano ${plan}.`);
  }
  return priceId;
}

export function planFromStripePriceId(priceId: string): BillingPlan | null {
  const entry = (
    Object.entries(priceByPlan) as [BillingPlan, string | undefined][]
  ).find(([, id]) => id === priceId);
  return entry?.[0] ?? null;
}

/** Stripe: lowercase / `canceled`. App: UPPERCASE / `CANCELLED`. */
export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): BillingStatus {
  switch (status) {
    case "trialing":
      return BillingStatus.TRIALING;
    case "active":
      return BillingStatus.ACTIVE;
    case "past_due":
      return BillingStatus.PAST_DUE;
    case "unpaid":
      return BillingStatus.UNPAID;
    default:
      return BillingStatus.CANCELLED;
  }
}
