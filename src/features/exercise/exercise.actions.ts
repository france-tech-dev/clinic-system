"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { requireOrgId, OrgContextError } from "@/shared/lib/org-context";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  exerciseFormSchema,
  exerciseIdSchema,
  updateExerciseSchema,
} from "./exercise.schema";
import {
  createExercise,
  deleteExercise,
  listExercises,
  restoreDefaultExercises,
  updateExercise,
} from "./exercise.service";
import type { ExerciseDTO } from "./exercise.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

export async function listExercisesAction(opts?: {
  search?: string;
  categoryId?: string | null;
}): Promise<ActionResult<ExerciseDTO[]>> {
  try {
    const { organizationId } = await requireOrgId();
    const data = await listExercises(organizationId, opts);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function createExerciseAction(
  input: unknown,
): Promise<ActionResult<ExerciseDTO>> {
  try {
    const parsed = exerciseFormSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const { organizationId } = await requireOrgId();
    const data = await createExercise(organizationId, parsed.data);
    revalidatePath(paths.biblioteca);
    revalidatePath(paths.painel);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateExerciseAction(
  input: unknown,
): Promise<ActionResult<ExerciseDTO>> {
  try {
    const parsed = updateExerciseSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const { organizationId } = await requireOrgId();
    const { id, ...data } = parsed.data;
    const updated = await updateExercise(organizationId, id, data);
    if (!updated) return fail("Atividade não encontrada");
    revalidatePath(paths.biblioteca);
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteExerciseAction(
  input: unknown,
): Promise<ActionResult<ExerciseDTO>> {
  try {
    const parsed = exerciseIdSchema.safeParse(input);
    if (!parsed.success) return fail("ID inválido");
    const { organizationId } = await requireOrgId();
    const deleted = await deleteExercise(organizationId, parsed.data.id);
    if (!deleted) return fail("Atividade não encontrada");
    revalidatePath(paths.biblioteca);
    revalidatePath(paths.painel);
    return ok(deleted);
  } catch (error) {
    return handleError(error);
  }
}

export async function restoreDefaultExercisesAction(): Promise<
  ActionResult<ExerciseDTO[]>
> {
  try {
    const { organizationId } = await requireOrgId();
    const data = await restoreDefaultExercises(organizationId);
    revalidatePath(paths.biblioteca);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
