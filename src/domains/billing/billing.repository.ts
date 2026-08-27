import { db } from "@/shared/lib/prisma";
import type {
  BillingPlan,
  BillingStatus,
} from "@prisma/enums";

export type BillingUpsertInput = {
  organizationId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: BillingStatus;
  plan: BillingPlan | null;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
};

export const billingRepository = {
  findByOrganizationId(organizationId: string) {
    return db.organizationBilling.findUnique({
      where: { organizationId },
    });
  },

  findOrgBillingSnapshot(organizationId: string) {
    return db.organization.findUnique({
      where: { id: organizationId },
      select: {
        billingExempt: true,
        billing: {
          select: {
            status: true,
            plan: true,
            trialEndsAt: true,
            stripeCustomerId: true,
          },
        },
      },
    });
  },

  findByStripeCustomerId(stripeCustomerId: string) {
    return db.organizationBilling.findUnique({
      where: { stripeCustomerId },
    });
  },

  findByStripeSubscriptionId(stripeSubscriptionId: string) {
    return db.organizationBilling.findUnique({
      where: { stripeSubscriptionId },
    });
  },

  upsertByOrganizationId(data: BillingUpsertInput) {
    const { organizationId, ...rest } = data;
    return db.organizationBilling.upsert({
      where: { organizationId },
      create: { organizationId, ...rest },
      update: rest,
    });
  },
};
