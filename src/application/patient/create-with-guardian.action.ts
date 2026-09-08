"use server";

import { handleGuardianActionError } from "@/domains/guardian/_lib/action-errors";
import { createGuardianSchema } from "@/domains/guardian/guardian.schema";
import { createGuardian } from "@/domains/guardian/guardian.service";
import type { CreatedGuardianDTO } from "@/domains/guardian/guardian.types";
import { patientFormSchema } from "@/domains/patient/patient.schema";
import { createPatient } from "@/domains/patient/patient.service";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { requirePermission } from "@/server/auth/permissions";
import { findProxyMember } from "@/server/auth/proxy-member";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { AppError } from "@/shared/lib/app-error";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePatientPaths } from "./_lib/revalidate-patient-paths";

const createPatientBodySchema = patientFormSchema.omit({ guardianId: true });

/**
 * Cria responsável + paciente num único round-trip (auth/billing uma vez).
 * Usar quando o fluxo cria um responsável novo; responsável existente → `createPatientAction`.
 */
export async function createPatientWithGuardianAction(
  input: unknown,
): Promise<
  ActionResult<{ patient: PatientDTO; guardian: CreatedGuardianDTO }>
> {
  try {
    await requirePermission({ project: ["create"] });
    if (!input || typeof input !== "object") {
      throw new AppError("Dados inválidos");
    }
    const raw = input as { patient?: unknown; guardian?: unknown };
    const guardianPayload = AppError.parse(createGuardianSchema, raw.guardian);
    const patientPayload = AppError.parse(createPatientBodySchema, raw.patient);
    const { organizationId, userId } = await requireOrgWrite();

    const guardian = await createGuardian(organizationId, guardianPayload);

    const member = await findProxyMember(userId, organizationId);
    const memberIds = isLeadershipRole(member?.role ?? null)
      ? (patientPayload.memberIds ?? [])
      : [];

    const patient = await createPatient(organizationId, {
      ...patientPayload,
      guardianId: guardian.id,
      memberIds,
    });

    revalidatePatientPaths();
    return ok({ patient, guardian });
  } catch (error) {
    return handleGuardianActionError(error);
  }
}
