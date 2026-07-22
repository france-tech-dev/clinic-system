"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { firstZodMessage, zodFieldErrors } from "@/shared/lib/zod-field-errors";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import {
  fail,
  ok,
  type ActionResult,
  type FieldErrors,
} from "@/shared/types/action-result";
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

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error && error.message) {
    const known =
      error.message.includes("CPF") ||
      error.message.includes("e-mail") ||
      error.message.includes("E-mail") ||
      error.message.includes("portal") ||
      error.message.includes("senhas") ||
      error.message.includes("Responsável") ||
      error.message.includes("utilizador");
    if (known) {
      return fail(error.message, fieldErrorsFromMessage(error.message));
    }
  }
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidateGuardianPaths(patientId?: string) {
  revalidatePath(paths.pacientes);
  if (patientId) revalidatePath(paths.paciente(patientId));
}

export async function createGuardianAction(
  input: unknown,
): Promise<ActionResult<CreatedGuardianDTO>> {
  try {
    const parsed = createGuardianSchema.safeParse(input);
    if (!parsed.success) {
      return fail(
        firstZodMessage(parsed.error),
        zodFieldErrors(parsed.error),
      );
    }
    const { organizationId } = await requireOrgId();
    const data = await createGuardian(organizationId, parsed.data);
    revalidateGuardianPaths();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateGuardianAction(
  input: unknown,
): Promise<ActionResult<GuardianDTO>> {
  try {
    const parsed = updateGuardianSchema.safeParse(input);
    if (!parsed.success) {
      return fail(
        firstZodMessage(parsed.error),
        zodFieldErrors(parsed.error),
      );
    }
    const { organizationId } = await requireOrgId();
    const data = await updateGuardian(organizationId, parsed.data);
    if (!data) return fail("Responsável não encontrado");
    revalidateGuardianPaths();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function enableGuardianPortalAccessAction(
  input: unknown,
): Promise<ActionResult<CreatedGuardianDTO>> {
  try {
    const parsed = enableGuardianPortalSchema.safeParse(input);
    if (!parsed.success) {
      return fail(
        firstZodMessage(parsed.error),
        zodFieldErrors(parsed.error),
      );
    }
    const { organizationId } = await requireOrgId();
    const data = await enableGuardianPortalAccess(organizationId, parsed.data);
    revalidateGuardianPaths();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
