"use server";

import { handleGuardianActionError } from "@/domains/guardian/_lib/action-errors";
import { createGuardianSchema } from "@/domains/guardian/guardian.schema";
import type { CreatedGuardianDTO } from "@/domains/guardian/guardian.types";
import { patientFormSchema } from "@/domains/patient/patient.schema";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { requirePermission } from "@/server/auth/permissions";
import { findProxyMember } from "@/server/auth/proxy-member";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { AppError } from "@/shared/lib/app-error";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePatientPaths } from "./_lib/revalidate-patient-paths";
import { createPatientWithGuardianRecord } from "./_lib/write-patient-with-guardian";

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
    await requirePermission({ patients: ["create"] });
    if (!input || typeof input !== "object") {
      throw new AppError("Dados inválidos");
    }
    const raw = input as { patient?: unknown; guardian?: unknown };
    const guardianPayload = AppError.parse(createGuardianSchema, raw.guardian);
    const patientPayload = AppError.parse(createPatientBodySchema, raw.patient);
    const { organizationId, userId } = await requireOrgWrite();

    const member = await findProxyMember(userId, organizationId);
    const memberIds = isLeadershipRole(member?.role ?? null)
      ? (patientPayload.memberIds ?? [])
      : [];

    const data = await createPatientWithGuardianRecord(
      organizationId,
      guardianPayload,
      { ...patientPayload, memberIds },
    );

    revalidatePatientPaths();
    return ok(data);
  } catch (error) {
    return handleGuardianActionError(error);
  }
}
