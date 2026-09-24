"use server";

import { requirePermission } from "@/server/auth/permissions";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import {
  evolutionFormSchema,
  evolutionIdSchema,
  updateEvolutionSchema,
} from "./evolution.schema";
import {
  createEvolution,
  deleteEvolution,
  resolveAuthorMemberId,
  updateEvolution,
} from "./evolution.service";
import type { EvolutionDTO } from "./evolution.types";

function revalidatePatient(patientId: string) {
  revalidatePath(paths.paciente(patientId));
  revalidatePath(paths.pacientes);
  revalidatePath(paths.agenda);
}

export async function createEvolutionAction(
  input: unknown,
): Promise<ActionResult<EvolutionDTO>> {
  try {
    await requirePermission({ project: ["create"] });
    const payload = AppError.parse(evolutionFormSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const memberId = await resolveAuthorMemberId(organizationId, userId);
    const data = await createEvolution(organizationId, payload, memberId);
    if (!data) {
      throw new AppError("Agendamento não encontrado ou já possui evolução");
    }
    revalidatePatient(payload.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updateEvolutionAction(
  input: unknown,
): Promise<ActionResult<EvolutionDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateEvolutionSchema, input);
    const { organizationId } = await requireOrgWrite();
    const { id, ...rest } = payload;
    const data = await updateEvolution(organizationId, id, rest);
    if (!data) {
      throw new AppError("Evolução ou agendamento não encontrado");
    }
    revalidatePatient(rest.patientId);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteEvolutionAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  try {
    await requirePermission({ project: ["delete"] });
    const { id } = AppError.parse(evolutionIdSchema, input);
    const { organizationId } = await requireOrgWrite();
    const removed = await deleteEvolution(organizationId, id);
    if (!removed) throw new AppError("Evolução não encontrada");
    revalidatePatient(removed.patientId);
    return ok({ id: removed.id });
  } catch (error) {
    return AppError.result(error);
  }
}
