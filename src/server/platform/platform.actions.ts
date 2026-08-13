"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { paths } from "@/shared/constants/paths";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { requirePlatformAdmin } from "@/server/platform/require-platform-admin";
import {
  listPlatformOrganizations,
  setOrganizationBillingExempt,
  type PlatformOrganizationRow,
} from "@/server/platform/platform-organizations";

const setExemptSchema = z.object({
  organizationId: z.string().min(1),
  billingExempt: z.boolean(),
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
