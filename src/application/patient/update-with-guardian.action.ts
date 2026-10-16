"use server";

import { handleGuardianActionError } from "@/domains/guardian/_lib/action-errors";
import { updateGuardianSchema } from "@/domains/guardian/guardian.schema";
import type { GuardianDTO } from "@/domains/guardian/guardian.types";
import { updatePatientSchema } from "@/domains/patient/patient.schema";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { requirePermission } from "@/server/auth/permissions";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { AppError } from "@/shared/lib/app-error";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePatientPaths } from "./_lib/revalidate-patient-paths";
import { updatePatientWithGuardianRecord } from "./_lib/write-patient-with-guardian";

/** Actualiza paciente + responsável num único round-trip (auth/billing uma vez). */
export async function updatePatientWithGuardianAction(
  input: unknown,
): Promise<ActionResult<{ patient: PatientDTO; guardian: GuardianDTO }>> {
  try {
    await requirePermission({ patients: ["update"] });
    if (!input || typeof input !== "object") {
      throw new AppError("Dados inválidos");
    }
    const raw = input as { patient?: unknown; guardian?: unknown };
    const guardianPayload = AppError.parse(updateGuardianSchema, raw.guardian);
    const patientPayload = AppError.parse(updatePatientSchema, raw.patient);
    const { organizationId } = await requireOrgWrite();

    const data = await updatePatientWithGuardianRecord(
      organizationId,
      guardianPayload,
      patientPayload,
    );

    revalidatePatientPaths(patientPayload.id);
    return ok(data);
  } catch (error) {
    return handleGuardianActionError(error);
  }
}
