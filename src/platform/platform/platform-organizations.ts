import { db } from "@/shared/lib/prisma";
import type {
  BillingPlan,
  BillingStatus,
} from "@prisma/enums";

export type PlatformOrganizationRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
  billingExempt: boolean;
  billingStatus: BillingStatus | null;
  billingPlan: BillingPlan | null;
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
    billingStatus: (row.billing?.status as BillingStatus | undefined) ?? null,
    billingPlan:
      (row.billing?.plan as BillingPlan | null | undefined) ?? null,
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

export async function getPlatformOrganizationSlug(
  organizationId: string,
): Promise<string | null> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { slug: true },
  });
  return org?.slug ?? null;
}

export type DeletedPlatformOrganization = {
  id: string;
  name: string;
  logo: string | null;
  stripeCustomerId: string | null;
};

export async function deletePlatformOrganization(
  organizationId: string,
): Promise<DeletedPlatformOrganization | null> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: {
      id: true,
      name: true,
      logo: true,
      billing: { select: { stripeCustomerId: true } },
    },
  });
  if (!org) return null;

  await db.$transaction(async (tx) => {
    await tx.patient.deleteMany({ where: { organizationId } });
    await tx.organization.delete({ where: { id: organizationId } });
    await tx.session.updateMany({
      where: { activeOrganizationId: organizationId },
      data: { activeOrganizationId: null },
    });
  });

  return {
    id: org.id,
    name: org.name,
    logo: org.logo,
    stripeCustomerId: org.billing?.stripeCustomerId ?? null,
  };
}
