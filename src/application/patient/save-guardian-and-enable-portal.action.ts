"use server";

import { handleGuardianActionError } from "@/domains/guardian/_lib/action-errors";
import {
  enableGuardianPortalSchema,
  updateGuardianSchema,
} from "@/domains/guardian/guardian.schema";
import {
  enableGuardianPortalAccess,
  updateGuardian,
} from "@/domains/guardian/guardian.service";
import type { CreatedGuardianDTO } from "@/domains/guardian/guardian.types";
import { requirePermission } from "@/server/auth/permissions";
import { requireOrgFeatureWrite } from "@/server/billing/require-billing";
import { AppError } from "@/shared/lib/app-error";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePatientPaths } from "./_lib/revalidate-patient-paths";

/**
 * Guarda o responsável e activa o portal num único round-trip.
 * Requer feature `portal` do plano.
 */
export async function saveGuardianAndEnablePortalAction(
  input: unknown,
): Promise<ActionResult<CreatedGuardianDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    if (!input || typeof input !== "object") {
      throw new AppError("Dados inválidos");
    }
    const raw = input as { guardian?: unknown; portal?: unknown };
    const guardianPayload = AppError.parse(updateGuardianSchema, raw.guardian);
    const portalPayload = AppError.parse(
      enableGuardianPortalSchema,
      raw.portal ?? { id: guardianPayload.id },
    );
    if (portalPayload.id !== guardianPayload.id) {
      throw new AppError("Dados inválidos");
    }

    const { organizationId } = await requireOrgFeatureWrite("portal");

    const saved = await updateGuardian(organizationId, guardianPayload);
    if (!saved) throw new AppError("Responsável não encontrado");

    const data = await enableGuardianPortalAccess(
      organizationId,
      portalPayload,
    );
    revalidatePatientPaths();
    return ok(data);
  } catch (error) {
    return handleGuardianActionError(error);
  }
}
