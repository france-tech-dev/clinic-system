"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { paths } from "@/shared/constants/paths";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { requirePlatformAdmin } from "@/server/platform/require-platform-admin";
import {
  deletePlatformOrganization,
  getPlatformOrganizationSlug,
  listPlatformOrganizations,
  setOrganizationBillingExempt,
  type PlatformOrganizationRow,
} from "@/server/platform/platform-organizations";
import { deleteManagedImage } from "@/shared/lib/media";
import { getStripe } from "@/shared/lib/stripe";

const setExemptSchema = z.object({
  organizationId: z.string().min(1),
  billingExempt: z.boolean(),
});

const deleteOrgSchema = z.object({
  organizationId: z.string().min(1),
  /** Confirmação: o slug exacto da clínica. */
  confirmSlug: z.string().min(1),
});

export type PlatformOrganizationDTO = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  billingExempt: boolean;
  billingStatus: string | null;
  billingPlan: string | null;
  trialEndsAt: string | null;
};

function toDTO(row: PlatformOrganizationRow): PlatformOrganizationDTO {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.createdAt.toISOString(),
    billingExempt: row.billingExempt,
    billingStatus: row.billingStatus,
    billingPlan: row.billingPlan,
    trialEndsAt: row.trialEndsAt?.toISOString() ?? null,
  };
}

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

export async function listPlatformOrganizationsAction(): Promise<
  ActionResult<PlatformOrganizationDTO[]>
> {
  try {
    await requirePlatformAdmin();
    const rows = await listPlatformOrganizations();
    return ok(rows.map(toDTO));
  } catch (error) {
    return handleError(error);
  }
}

export async function setOrganizationBillingExemptAction(
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    await requirePlatformAdmin();
    const parsed = setExemptSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);
    await setOrganizationBillingExempt(
      parsed.data.organizationId,
      parsed.data.billingExempt,
    );
    revalidatePath(paths.plataforma);
    return ok(undefined);
  } catch (error) {
    return handleError(error);
  }
}

export async function deletePlatformOrganizationAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePlatformAdmin();
    const parsed = deleteOrgSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);

    const slug = await getPlatformOrganizationSlug(parsed.data.organizationId);
    if (!slug) return fail("Clínica não encontrada.");
    if (slug !== parsed.data.confirmSlug) {
      return fail("O slug não coincide. Digite o slug exacto para confirmar.");
    }

    const deleted = await deletePlatformOrganization(
      parsed.data.organizationId,
    );
    if (!deleted) return fail("Clínica não encontrada.");

    if (deleted.logo) {
      await deleteManagedImage(deleted.logo).catch(() => undefined);
    }

    const stripe = getStripe();
    if (stripe && deleted.stripeCustomerId) {
      try {
        await stripe.customers.del(deleted.stripeCustomerId);
      } catch (error) {
        console.error(
          "Falha ao remover customer Stripe após exclusão da clínica:",
          error,
        );
      }
    }

    revalidatePath(paths.plataforma);
    return ok({ id: deleted.id });
  } catch (error) {
    return handleError(error);
  }
}
