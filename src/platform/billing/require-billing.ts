import type { GatedFeatureId } from "@/shared/constants/billing-plans";
import {
  countBillableProfessionals,
  getBillingAccess,
} from "@/server/billing/access";
import { requireOrgId } from "@/shared/lib/org-context";

async function requireWritableBilling(organizationId: string): Promise<void> {
  const access = await getBillingAccess(organizationId);
  if (access.mode === "read_only") {
    throw new Error(
      "O período de teste acabou. Assine um plano para continuar a editar.",
    );
  }
}

/** Gate de assentos do plano (ex.: criar profissional). */
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

/** Org activa + billing em modo escrita. Use nas actions sem feature gated. */
export async function requireOrgWrite() {
  const ctx = await requireOrgId();
  await requireWritableBilling(ctx.organizationId);
  return ctx;
}

/** Como `requireOrgWrite`, mais feature do plano (anamnese, caixa, …). */
export async function requireOrgFeatureWrite(feature: GatedFeatureId) {
  const ctx = await requireOrgWrite();
  const billing = await getBillingAccess(ctx.organizationId);
  if (!billing.features.includes(feature)) {
    throw new Error("Este recurso não está incluído no seu plano.");
  }
  return { ...ctx, billing };
}
