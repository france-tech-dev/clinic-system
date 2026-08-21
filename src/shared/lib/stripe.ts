import Stripe from "stripe";
import { BillingPlan, BillingStatus } from "../../../prisma/generated/prisma/enums";

let client: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (client !== undefined) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  client = key ? new Stripe(key) : null;
  return client;
}

export function requireStripe(): Stripe {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("STRIPE_SECRET_KEY não está configurada.");
  }
  return stripe;
}

export function getStripeWebhookSecret(): string | null {
  return process.env.STRIPE_WEBHOOK_SECRET ?? null;
}

const PRICE_ENV: Record<BillingPlan, string> = {
  [BillingPlan.STARTER]: "STRIPE_PRICE_STARTER",
  [BillingPlan.PRO]: "STRIPE_PRICE_PRO",
  [BillingPlan.ENTERPRISE]: "STRIPE_PRICE_ENTERPRISE",
};

export function getStripePriceId(plan: BillingPlan): string | null {
  const value = process.env[PRICE_ENV[plan]];
  return value || null;
}

export function requireStripePriceId(plan: BillingPlan): string {
  const priceId = getStripePriceId(plan);
  if (!priceId) {
    throw new Error(`${PRICE_ENV[plan]} não está configurada.`);
  }
  return priceId;
}

export function planFromStripePriceId(priceId: string): BillingPlan | null {
  for (const plan of Object.keys(PRICE_ENV) as BillingPlan[]) {
    if (getStripePriceId(plan) === priceId) return plan;
  }
  return null;
}

/**
 * Stripe uses lowercase statuses and `canceled` (one L).
 * App / Prisma use UPPERCASE and `CANCELLED` (two L).
 */
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
