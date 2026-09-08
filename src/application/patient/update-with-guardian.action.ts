"use server";

import { handleGuardianActionError } from "@/domains/guardian/_lib/action-errors";
import { updateGuardianSchema } from "@/domains/guardian/guardian.schema";
import { updateGuardian } from "@/domains/guardian/guardian.service";
import type { GuardianDTO } from "@/domains/guardian/guardian.types";
import { updatePatientSchema } from "@/domains/patient/patient.schema";
import { updatePatient } from "@/domains/patient/patient.service";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { requirePermission } from "@/server/auth/permissions";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { AppError } from "@/shared/lib/app-error";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePatientPaths } from "./_lib/revalidate-patient-paths";

/** Actualiza paciente + responsável num único round-trip (auth/billing uma vez). */
export async function updatePatientWithGuardianAction(
  input: unknown,
): Promise<ActionResult<{ patient: PatientDTO; guardian: GuardianDTO }>> {
  try {
    await requirePermission({ project: ["update"] });
    if (!input || typeof input !== "object") {
      throw new AppError("Dados inválidos");
    }
    const raw = input as { patient?: unknown; guardian?: unknown };
    const guardianPayload = AppError.parse(updateGuardianSchema, raw.guardian);
    const patientPayload = AppError.parse(updatePatientSchema, raw.patient);
    const { organizationId } = await requireOrgWrite();

    const guardian = await updateGuardian(organizationId, guardianPayload);
    if (!guardian) throw new AppError("Responsável não encontrado");

    const { id, ...rest } = patientPayload;
    const patient = await updatePatient(organizationId, id, rest);
    if (!patient) throw new AppError("Paciente não encontrado");

    revalidatePatientPaths(id);
    return ok({ patient, guardian });
  } catch (error) {
    return handleGuardianActionError(error);
  }
}
