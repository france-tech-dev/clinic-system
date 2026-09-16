import {
  countBillableProfessionals,
  getBillingAccess,
} from "@/server/billing/access";
import { requireOrgId } from "@/shared/lib/org-context";

async function requireWritableBilling(organizationId: string): Promise<void> {
  const access = await getBillingAccess(organizationId);
  if (access.mode === "read_only") {
    throw new Error(
      "O período de teste acabou. Assine um plano para continuar editando.",
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
  if (count < access.maxProfessionals) return;

  throw new Error(
    `Limite de ${access.maxProfessionals} profissionais atingido. Atualize a assinatura em Planos.`,
  );
}

/** Org ativa + billing em modo escrita. */
export async function requireOrgWrite() {
  const ctx = await requireOrgId();
  await requireWritableBilling(ctx.organizationId);
  return ctx;
}
