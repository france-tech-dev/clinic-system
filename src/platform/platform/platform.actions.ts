"use server";

import {
  deletePlatformOrganization,
  getPlatformOrganizationSlug,
  listPlatformOrganizations,
  setOrganizationBillingExempt,
  type PlatformOrganizationRow,
} from "@/server/platform/platform-organizations";
import { requirePlatformAdmin } from "@/server/platform/require-platform-admin";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { deleteManagedImage } from "@/shared/lib/media";
import { getStripe } from "@/shared/lib/stripe";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

export async function listPlatformOrganizationsAction(): Promise<
  ActionResult<PlatformOrganizationDTO[]>
> {
  try {
    await requirePlatformAdmin();
    const rows = await listPlatformOrganizations();
    return ok(rows.map(toDTO));
  } catch (error) {
    return AppError.result(error);
  }
}

export async function setOrganizationBillingExemptAction(
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    await requirePlatformAdmin();
    const payload = AppError.parse(setExemptSchema, input);
    await setOrganizationBillingExempt(
      payload.organizationId,
      payload.billingExempt,
    );
    revalidatePath(paths.plataforma);
    return ok(undefined);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deletePlatformOrganizationAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePlatformAdmin();
    const payload = AppError.parse(deleteOrgSchema, input);

    const slug = await getPlatformOrganizationSlug(payload.organizationId);
    if (!slug) throw new AppError("Clínica não encontrada.");
    if (slug !== payload.confirmSlug) {
      throw new AppError(
        "O slug não coincide. Digite o slug exacto para confirmar.",
      );
    }

    const deleted = await deletePlatformOrganization(payload.organizationId);
    if (!deleted) throw new AppError("Clínica não encontrada.");

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
    return AppError.result(error);
  }
}
