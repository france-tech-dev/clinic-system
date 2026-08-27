"use server";

import { requirePermission } from "@/server/auth/permissions";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { subscribePlanSchema } from "./billing.schema";
import {
  createBillingPortalSession,
  createSubscribeCheckout,
  getBillingSnapshot,
  isStripeConfigured,
} from "./billing.service";
import type { BillingSnapshotDTO, CheckoutSessionDTO } from "./billing.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

export async function getBillingSnapshotAction(): Promise<
  ActionResult<BillingSnapshotDTO>
> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    return ok(await getBillingSnapshot(organizationId));
  } catch (error) {
    return handleError(error);
  }
}

export async function createSubscribeCheckoutAction(
  input: unknown,
): Promise<ActionResult<CheckoutSessionDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = subscribePlanSchema.safeParse(input);
    if (!parsed.success) return failZod(parsed.error);
    if (!isStripeConfigured()) {
      return fail("Billing ainda não está configurado neste ambiente.");
    }

    const { organizationId } = await requireOrgId();
    return ok(await createSubscribeCheckout(organizationId, parsed.data.plan));
  } catch (error) {
    return handleError(error);
  }
}

export async function createBillingPortalSessionAction(): Promise<
  ActionResult<CheckoutSessionDTO>
> {
  try {
    await requirePermission({ project: ["update"] });
    if (!isStripeConfigured()) {
      return fail("Billing ainda não está configurado neste ambiente.");
    }
    const { organizationId } = await requireOrgId();
    return ok(await createBillingPortalSession(organizationId));
  } catch (error) {
    return handleError(error);
  }
}
