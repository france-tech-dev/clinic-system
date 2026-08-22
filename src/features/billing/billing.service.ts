import { randomBytes } from "node:crypto";
import type Stripe from "stripe";
import { paths } from "@/shared/constants/paths";
import { billingRepository } from "./billing.repository";
import type { BillingSnapshotDTO, CheckoutSessionDTO } from "./billing.types";
import { getBillingAccess } from "@/server/billing/access";
import {
  getStripe,
  getStripePriceId,
  mapStripeSubscriptionStatus,
  planFromStripePriceId,
  requireStripe,
  requireStripePriceId,
} from "@/shared/lib/stripe";
import { BILLING_PLANS } from "@/shared/constants/billing-plans";
import {
  BillingPlan,
  BillingStatus,
} from "../../../prisma/generated/prisma/enums";
import { env } from "@/shared/env";

const WRITABLE_STATUSES: BillingStatus[] = [
  BillingStatus.TRIALING,
  BillingStatus.ACTIVE,
  BillingStatus.PAST_DUE,
];

function appBaseUrl() {
  return env.BETTER_AUTH_URL.replace(/\/$/, "");
}

function unixToDate(value: number | null | undefined): Date | null {
  return value ? new Date(value * 1000) : null;
}

function subscriptionPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const itemEnd = subscription.items.data[0]?.current_period_end;
  if (itemEnd) return unixToDate(itemEnd);
  const legacy = (subscription as { current_period_end?: number })
    .current_period_end;
  return unixToDate(legacy);
}

function parsePlan(value: string | null | undefined): BillingPlan | null {
  if (!value) return null;
  const normalized = value.toUpperCase() as BillingPlan;
  return (BILLING_PLANS as readonly string[]).includes(normalized)
    ? normalized
    : null;
}

function customerIdOf(subscription: Stripe.Subscription): string {
  return typeof subscription.customer === "string"
    ? subscription.customer
    : subscription.customer.id;
}

function resolvePlan(
  subscription: Stripe.Subscription,
  previousPlan: BillingPlan | null,
): BillingPlan | null {
  const metaPlan = parsePlan(subscription.metadata?.plan);
  if (metaPlan) return metaPlan;
  if (subscription.status === "trialing") return previousPlan;
  const priceId = subscription.items.data[0]?.price?.id;
  return priceId ? planFromStripePriceId(priceId) : previousPlan;
}

async function findOrganizationId(
  subscription: Stripe.Subscription,
): Promise<string | null> {
  const fromMeta = subscription.metadata?.organizationId;
  if (fromMeta) return fromMeta;

  const bySub = await billingRepository.findByStripeSubscriptionId(
    subscription.id,
  );
  if (bySub) return bySub.organizationId;

  const byCustomer = await billingRepository.findByStripeCustomerId(
    customerIdOf(subscription),
  );
  return byCustomer?.organizationId ?? null;
}

export async function getBillingSnapshot(
  organizationId: string,
): Promise<BillingSnapshotDTO> {
  const access = await getBillingAccess(organizationId);
  const org = await billingRepository.findOrgBillingSnapshot(organizationId);
  const row = org?.billing;

  return {
    mode: access.mode,
    status: (row?.status as BillingStatus | undefined) ?? access.status,
    plan: (row?.plan as BillingPlan | null | undefined) ?? access.plan,
    trialEndsAt:
      row?.trialEndsAt?.toISOString() ??
      access.trialEndsAt?.toISOString() ??
      null,
    isLegacy: access.isLegacy,
    billingExempt: org?.billingExempt ?? false,
    canManageBilling: Boolean(row?.stripeCustomerId),
    maxProfessionals: access.maxProfessionals,
  };
}

export async function createBillingPortalSession(
  organizationId: string,
): Promise<CheckoutSessionDTO> {
  const stripe = requireStripe();
  const row = await billingRepository.findByOrganizationId(organizationId);
  if (!row?.stripeCustomerId) {
    throw new Error("Esta clínica ainda não tem faturação Stripe.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: row.stripeCustomerId,
    return_url: `${appBaseUrl()}${paths.planos}`,
  });
  if (!session.url) {
    throw new Error("Não foi possível abrir o portal de faturação.");
  }
  return { url: session.url };
}

export async function createSubscribeCheckout(
  organizationId: string,
  plan: BillingPlan,
): Promise<CheckoutSessionDTO> {
  const stripe = requireStripe();
  const priceId = requireStripePriceId(plan);
  const baseUrl = appBaseUrl();
  const successUrl = `${baseUrl}${paths.planos}?sucesso=1`;
  const cancelUrl = `${baseUrl}${paths.planos}`;
  const integrationSuffix = randomBytes(4).toString("hex");

  const row = await billingRepository.findByOrganizationId(organizationId);

  if (
    row &&
    WRITABLE_STATUSES.includes(row.status) &&
    row.status !== BillingStatus.TRIALING
  ) {
    await updateSubscriptionPlan(row.stripeSubscriptionId, plan, priceId);
    return { url: successUrl };
  }

  if (row?.status === BillingStatus.TRIALING) {
    const price = await stripe.prices.retrieve(priceId);
    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      currency: price.currency,
      customer: row.stripeCustomerId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { organizationId, plan, intent: "trial_update" },
      setup_intent_data: {
        metadata: { organizationId, plan },
      },
      integration_identifier: `movi_setup_${integrationSuffix}`,
    });
    if (!session.url) throw new Error("Não foi possível criar o checkout.");
    return { url: session.url };
  }

  let customerId = row?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: { organizationId },
    });
    customerId = customer.id;
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: organizationId,
    metadata: { organizationId, plan },
    subscription_data: {
      metadata: { organizationId, plan },
    },
    integration_identifier: `movi_sub_${integrationSuffix}`,
  });
  if (!session.url) throw new Error("Não foi possível criar o checkout.");
  return { url: session.url };
}

async function updateSubscriptionPlan(
  subscriptionId: string,
  plan: BillingPlan,
  priceId: string,
  paymentMethodId?: string,
) {
  const stripe = requireStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const itemId = subscription.items.data[0]?.id;
  if (!itemId) throw new Error("Assinatura Stripe sem itens.");

  await stripe.subscriptions.update(subscriptionId, {
    items: [{ id: itemId, price: priceId }],
    metadata: {
      ...subscription.metadata,
      plan,
    },
    ...(paymentMethodId ? { default_payment_method: paymentMethodId } : {}),
    proration_behavior: "none",
  });
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const organizationId = await findOrganizationId(subscription);
  if (!organizationId) return;

  const existing = await billingRepository.findByOrganizationId(organizationId);

  await billingRepository.upsertByOrganizationId({
    organizationId,
    stripeCustomerId: customerIdOf(subscription),
    stripeSubscriptionId: subscription.id,
    status: mapStripeSubscriptionStatus(subscription.status),
    plan: resolvePlan(subscription, existing?.plan ?? null),
    trialEndsAt: unixToDate(subscription.trial_end),
    currentPeriodEnd: subscriptionPeriodEnd(subscription),
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const organizationId = session.metadata?.organizationId;
  const plan = parsePlan(session.metadata?.plan);
  if (!organizationId) return;

  if (session.mode === "setup") {
    const row = await billingRepository.findByOrganizationId(organizationId);
    if (!row || !plan) return;

    const stripe = requireStripe();
    const setupIntentId =
      typeof session.setup_intent === "string"
        ? session.setup_intent
        : session.setup_intent?.id;
    if (!setupIntentId) return;

    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    const paymentMethodId =
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id;
    if (!paymentMethodId) return;

    await stripe.customers.update(row.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    await updateSubscriptionPlan(
      row.stripeSubscriptionId,
      plan,
      requireStripePriceId(plan),
      paymentMethodId,
    );
    return;
  }

  if (session.mode === "subscription") {
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;
    if (!subscriptionId) return;
    const stripe = requireStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncSubscription(subscription);
  }
}

function subscriptionIdFromInvoice(invoice: Stripe.Invoice): string | null {
  const parentSub = invoice.parent?.subscription_details?.subscription;
  if (typeof parentSub === "string") return parentSub;
  if (parentSub && typeof parentSub === "object" && "id" in parentSub) {
    return parentSub.id;
  }
  const legacy = (invoice as { subscription?: string | { id: string } | null })
    .subscription;
  if (typeof legacy === "string") return legacy;
  if (legacy && typeof legacy === "object") return legacy.id;
  return null;
}

export async function handleStripeWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncSubscription(event.data.object as Stripe.Subscription);
      return;
    case "checkout.session.completed":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      return;
    case "invoice.paid":
    case "invoice.payment_failed": {
      const subscriptionId = subscriptionIdFromInvoice(
        event.data.object as Stripe.Invoice,
      );
      if (!subscriptionId) return;
      const stripe = requireStripe();
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      await syncSubscription(subscription);
      return;
    }
    default:
      return;
  }
}

export function isStripeConfigured(): boolean {
  return Boolean(
    getStripe() &&
    getStripePriceId(BillingPlan.STARTER) &&
    getStripePriceId(BillingPlan.PRO) &&
    getStripePriceId(BillingPlan.ENTERPRISE),
  );
}
