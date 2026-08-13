import {
  TRIAL_DAYS,
  type BillingStatusId,
} from "@/shared/constants/billing-plans";
import { db } from "@/shared/lib/prisma";
import { getStripe, getStripePriceId } from "@/shared/lib/stripe";

export async function startOrganizationTrial(
  organizationId: string,
  email: string,
): Promise<void> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      billingExempt: true,
      billing: { select: { id: true } },
    },
  });
  if (!org || org.billingExempt || org.billing) return;

  const stripe = getStripe();
  const starterPriceId = getStripePriceId("starter");
  if (!stripe || !starterPriceId) {
    console.warn(
      "[billing] Stripe não configurado — trial não iniciado para",
      organizationId,
    );
    return;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { organizationId },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: starterPriceId }],
    trial_period_days: TRIAL_DAYS,
    trial_settings: {
      end_behavior: { missing_payment_method: "cancel" },
    },
    metadata: { organizationId },
  });

  const status = subscription.status as BillingStatusId;
  const trialEndsAt = subscription.trial_end
    ? new Date(subscription.trial_end * 1000)
    : null;

  await db.organizationBilling.create({
    data: {
      organizationId,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      status,
      plan: null,
      trialEndsAt,
    },
  });
}
