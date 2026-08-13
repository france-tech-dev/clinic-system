import type { GatedFeatureId } from "@/shared/constants/billing-plans";
import {
  countBillableProfessionals,
  getBillingAccess,
} from "@/server/billing/access";

export async function requireWritableBilling(
  organizationId: string,
): Promise<void> {
  const access = await getBillingAccess(organizationId);
  if (access.mode === "read_only") {
    throw new Error(
      "O período de teste acabou. Assine um plano para continuar a editar.",
    );
  }
}

export async function requireBillingFeature(
  organizationId: string,
  feature: GatedFeatureId,
): Promise<void> {
  const access = await getBillingAccess(organizationId);
  if (!access.features.includes(feature)) {
    throw new Error("Este recurso não está incluído no seu plano.");
  }
}

export async function requireSeatAvailable(
  organizationId: string,
): Promise<void> {
  const access = await getBillingAccess(organizationId);
  if (access.maxProfessionals == null) return;

  const count = await countBillableProfessionals(organizationId);
  if (count >= access.maxProfessionals) {
    throw new Error(
      `O plano atual permite até ${access.maxProfessionals} profissionais.`,
    );
  }
}

export async function requireOrgWrite() {
  const { requireOrgId } = await import("@/shared/lib/org-context");
  const ctx = await requireOrgId();
  await requireWritableBilling(ctx.organizationId);
  return ctx;
}

export async function requireOrgFeatureWrite(feature: GatedFeatureId) {
  const ctx = await requireOrgWrite();
  await requireBillingFeature(ctx.organizationId, feature);
  return ctx;
}
