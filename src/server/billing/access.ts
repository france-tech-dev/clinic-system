import { db } from "@/shared/lib/prisma";
import {
  GATED_FEATURES,
  resolveBillingAccess,
  type BillingAccess,
  type BillingPlanId,
  type BillingStatusId,
} from "@/shared/constants/billing-plans";
import { canAccessClinicPanel } from "@/shared/lib/member-role";
import type { Role } from "../../../prisma/generated/prisma/enums";

const EXEMPT_ACCESS: BillingAccess = {
  mode: "full",
  status: null,
  plan: null,
  trialEndsAt: null,
  features: GATED_FEATURES,
  maxProfessionals: null,
  isLegacy: false,
};

export async function getBillingAccess(
  organizationId: string,
): Promise<BillingAccess> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      billingExempt: true,
      billing: {
        select: { status: true, plan: true, trialEndsAt: true },
      },
    },
  });

  if (!org) return resolveBillingAccess(null);
  if (org.billingExempt) return EXEMPT_ACCESS;

  return resolveBillingAccess(
    org.billing
      ? {
          status: org.billing.status as BillingStatusId,
          plan: org.billing.plan as BillingPlanId | null,
          trialEndsAt: org.billing.trialEndsAt,
        }
      : null,
  );
}

export async function countBillableProfessionals(
  organizationId: string,
): Promise<number> {
  const members = await db.member.findMany({
    where: { organizationId, status: "active" },
    select: { role: true },
  });

  return members.filter((member) => canAccessClinicPanel(member.role as Role))
    .length;
}
