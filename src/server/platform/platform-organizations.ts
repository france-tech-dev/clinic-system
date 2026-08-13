import { db } from "@/shared/lib/prisma";
import type {
  BillingPlanId,
  BillingStatusId,
} from "@/shared/constants/billing-plans";

export type PlatformOrganizationRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  billingExempt: boolean;
  billingStatus: BillingStatusId | null;
  billingPlan: BillingPlanId | null;
  trialEndsAt: Date | null;
};

export async function listPlatformOrganizations(): Promise<
  PlatformOrganizationRow[]
> {
  const rows = await db.organization.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      createdAt: true,
      billingExempt: true,
      billing: {
        select: { status: true, plan: true, trialEndsAt: true },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.createdAt,
    billingExempt: row.billingExempt,
    billingStatus: (row.billing?.status as BillingStatusId | undefined) ?? null,
    billingPlan: (row.billing?.plan as BillingPlanId | null | undefined) ?? null,
    trialEndsAt: row.billing?.trialEndsAt ?? null,
  }));
}

export async function setOrganizationBillingExempt(
  organizationId: string,
  billingExempt: boolean,
): Promise<void> {
  await db.organization.update({
    where: { id: organizationId },
    data: { billingExempt },
  });
}
