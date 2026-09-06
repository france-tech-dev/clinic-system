"use server";

import { requirePermission } from "@/server/auth/permissions";
import {
  requireOrgFeatureWrite,
  requireOrgWrite,
} from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import {
  ok,
  type ActionResult,
  type FieldErrors,
} from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import {
  createGuardianSchema,
  enableGuardianPortalSchema,
  updateGuardianSchema,
} from "./guardian.schema";
import {
  createGuardian,
  enableGuardianPortalAccess,
  updateGuardian,
} from "./guardian.service";
import type { CreatedGuardianDTO, GuardianDTO } from "./guardian.types";

function fieldErrorsFromMessage(message: string): FieldErrors | undefined {
  const lower = message.toLowerCase();
  if (lower.includes("cpf")) return { cpf: message };
  if (lower.includes("e-mail") || lower.includes("email")) {
    return { email: message };
  }
  if (lower.includes("senhas") || lower.includes("senha")) {
    return { confirmPassword: message };
  }
  return undefined;
}

function handleGuardianError(error: unknown): ActionResult<never> {
  if (error instanceof Error && !(error instanceof AppError) && error.message) {
    return new AppError(error.message, {
      fieldErrors: fieldErrorsFromMessage(error.message),
    }).result();
  }
  return AppError.result(error);
}

function revalidateGuardianPaths(patientId?: string) {
  revalidatePath(paths.pacientes);
  if (patientId) revalidatePath(paths.paciente(patientId));
}

export async function createGuardianAction(
  input: unknown,
): Promise<ActionResult<CreatedGuardianDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(createGuardianSchema, input);
    const { organizationId } = await requireOrgWrite();
    const data = await createGuardian(organizationId, payload);
    revalidateGuardianPaths();
    return ok(data);
  } catch (error) {
    return handleGuardianError(error);
  }
}

export async function updateGuardianAction(
  input: unknown,
): Promise<ActionResult<GuardianDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateGuardianSchema, input);
    const { organizationId } = await requireOrgWrite();
    const data = await updateGuardian(organizationId, payload);
    if (!data) throw new AppError("Responsável não encontrado");
    revalidateGuardianPaths();
    return ok(data);
  } catch (error) {
    return handleGuardianError(error);
  }
}

export async function enableGuardianPortalAccessAction(
  input: unknown,
): Promise<ActionResult<CreatedGuardianDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(enableGuardianPortalSchema, input);
    const { organizationId } = await requireOrgFeatureWrite("portal");
    const data = await enableGuardianPortalAccess(organizationId, payload);
    revalidateGuardianPaths();
    return ok(data);
  } catch (error) {
    return handleGuardianError(error);
  }
}
