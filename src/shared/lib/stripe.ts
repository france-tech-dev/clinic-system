import { env } from "@/shared/env";
import { BillingPlan, BillingStatus } from "@prisma/enums";
import Stripe from "stripe";

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
  [BillingPlan.SOLO]: env.STRIPE_PRICE_SOLO,
  [BillingPlan.PRO]: env.STRIPE_PRICE_PRO,
  [BillingPlan.ENTERPRISE]: env.STRIPE_PRICE_ENTERPRISE,
};

export function getStripePriceId(plan: BillingPlan): string | null {
  return priceByPlan[plan] ?? null;
}

export function requireStripePriceId(plan: BillingPlan): string {
  const priceId = priceByPlan[plan];
  if (!priceId) {
    throw new Error(`Preço Stripe não configurado para o plano ${plan}.`);
  }
  return priceId;
}

export function getExtraSeatPriceId(): string | null {
  return env.STRIPE_PRICE_EXTRA_SEAT ?? null;
}

export function requireExtraSeatPriceId(): string {
  const priceId = getExtraSeatPriceId();
  if (!priceId) {
    throw new Error(
      "Preço Stripe não configurado para profissional adicional.",
    );
  }
  return priceId;
}

export function planFromStripePriceId(priceId: string): BillingPlan | null {
  const entry = (
    Object.entries(priceByPlan) as [BillingPlan, string | undefined][]
  ).find(([, id]) => id === priceId);
  return entry?.[0] ?? null;
}

export function extraSeatsFromSubscription(
  subscription: Stripe.Subscription,
): number {
  const extraPriceId = getExtraSeatPriceId();
  if (!extraPriceId) return 0;
  const item = subscription.items.data.find(
    (entry) => entry.price.id === extraPriceId,
  );
  return item?.quantity ?? 0;
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
