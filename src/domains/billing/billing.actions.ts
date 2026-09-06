"use server";

import { requirePermission } from "@/server/auth/permissions";
import { AppError } from "@/shared/lib/app-error";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { subscribePlanSchema } from "./billing.schema";
import {
  createBillingPortalSession,
  createSubscribeCheckout,
  getBillingSnapshot,
  isStripeConfigured,
} from "./billing.service";
import type { BillingSnapshotDTO, CheckoutSessionDTO } from "./billing.types";

export async function getBillingSnapshotAction(): Promise<
  ActionResult<BillingSnapshotDTO>
> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    return ok(await getBillingSnapshot(organizationId));
  } catch (error) {
    return AppError.result(error);
  }
}

export async function createSubscribeCheckoutAction(
  input: unknown,
): Promise<ActionResult<CheckoutSessionDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(subscribePlanSchema, input);
    if (!isStripeConfigured()) {
      throw new AppError("Billing ainda não está configurado neste ambiente.");
    }

    const { organizationId } = await requireOrgId();
    return ok(await createSubscribeCheckout(organizationId, payload.plan));
  } catch (error) {
    return AppError.result(error);
  }
}

export async function createBillingPortalSessionAction(): Promise<
  ActionResult<CheckoutSessionDTO>
> {
  try {
    await requirePermission({ project: ["update"] });
    if (!isStripeConfigured()) {
      throw new AppError("Billing ainda não está configurado neste ambiente.");
    }
    const { organizationId } = await requireOrgId();
    return ok(await createBillingPortalSession(organizationId));
  } catch (error) {
    return AppError.result(error);
  }
}
