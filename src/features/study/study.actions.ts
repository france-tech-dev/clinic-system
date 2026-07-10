"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { requireOrgId, OrgContextError } from "@/shared/lib/org-context";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  studyFormSchema,
  studyIdSchema,
  updateStudySchema,
} from "./study.schema";
import {
  createStudyCard,
  deleteStudyCard,
  listStudyCards,
  restoreDefaultStudy,
  updateStudyCard,
} from "./study.service";
import type { StudyCardDTO } from "./study.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidateStudy() {
  revalidatePath(paths.estudo);
  revalidatePath(paths.buscar);
  revalidatePath(paths.painel);
}

export async function listStudyCardsAction(opts?: {
  search?: string;
  categoryId?: string | null;
}): Promise<ActionResult<StudyCardDTO[]>> {
  try {
    const { organizationId } = await requireOrgId();
    const data = await listStudyCards(organizationId, opts);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function createStudyCardAction(
  input: unknown,
): Promise<ActionResult<StudyCardDTO>> {
  try {
    const parsed = studyFormSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const { organizationId } = await requireOrgId();
    const data = await createStudyCard(organizationId, parsed.data);
    revalidateStudy();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateStudyCardAction(
  input: unknown,
): Promise<ActionResult<StudyCardDTO>> {
  try {
    const parsed = updateStudySchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const { organizationId } = await requireOrgId();
    const { id, ...data } = parsed.data;
    const updated = await updateStudyCard(organizationId, id, data);
    if (!updated) return fail("Nota não encontrada");
    revalidateStudy();
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteStudyCardAction(
  input: unknown,
): Promise<ActionResult<StudyCardDTO>> {
  try {
    const parsed = studyIdSchema.safeParse(input);
    if (!parsed.success) return fail("ID inválido");
    const { organizationId } = await requireOrgId();
    const deleted = await deleteStudyCard(organizationId, parsed.data.id);
    if (!deleted) return fail("Nota não encontrada");
    revalidateStudy();
    return ok(deleted);
  } catch (error) {
    return handleError(error);
  }
}

export async function restoreDefaultStudyAction(): Promise<
  ActionResult<StudyCardDTO[]>
> {
  try {
    const { organizationId } = await requireOrgId();
    const data = await restoreDefaultStudy(organizationId);
    revalidateStudy();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
