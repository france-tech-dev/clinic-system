import Stripe from "stripe";
import type { BillingPlanId } from "@/shared/constants/billing-plans";

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

const PRICE_ENV: Record<BillingPlanId, string> = {
  starter: "STRIPE_PRICE_STARTER",
  pro: "STRIPE_PRICE_PRO",
  enterprise: "STRIPE_PRICE_ENTERPRISE",
};

export function getStripePriceId(plan: BillingPlanId): string | null {
  const value = process.env[PRICE_ENV[plan]];
  return value || null;
}

export function requireStripePriceId(plan: BillingPlanId): string {
  const priceId = getStripePriceId(plan);
  if (!priceId) {
    throw new Error(`${PRICE_ENV[plan]} não está configurada.`);
  }
  return priceId;
}

export function planFromStripePriceId(priceId: string): BillingPlanId | null {
  for (const plan of Object.keys(PRICE_ENV) as BillingPlanId[]) {
    if (getStripePriceId(plan) === priceId) return plan;
  }
  return null;
}
