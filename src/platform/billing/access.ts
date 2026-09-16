import {
  resolveBillingAccess,
  type BillingAccess,
} from "@/shared/constants/billing-plans";
import { canAccessClinicPanel } from "@/shared/lib/member-role";
import { db } from "@/shared/lib/prisma";
import {
  BillingPlan,
  BillingStatus,
  MemberStatus,
  type Role,
} from "@prisma/enums";

const EXEMPT_ACCESS: BillingAccess = {
  mode: "full",
  status: null,
  plan: null,
  trialEndsAt: null,
  maxProfessionals: null,
  extraSeats: 0,
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
        select: {
          status: true,
          plan: true,
          trialEndsAt: true,
          extraSeats: true,
        },
      },
    },
  });

  if (!org) return resolveBillingAccess(null);
  if (org.billingExempt) return EXEMPT_ACCESS;

  return resolveBillingAccess(
    org.billing
      ? {
          status: org.billing.status as BillingStatus,
          plan: org.billing.plan as BillingPlan | null,
          trialEndsAt: org.billing.trialEndsAt,
          extraSeats: org.billing.extraSeats,
        }
      : null,
  );
}

export async function countBillableProfessionals(
  organizationId: string,
): Promise<number> {
  const members = await db.member.findMany({
    where: { organizationId, status: MemberStatus.ACTIVE },
    select: { role: true },
  });

  return members.filter((member) => canAccessClinicPanel(member.role as Role))
    .length;
}
