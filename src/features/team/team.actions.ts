"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { paths } from "@/shared/constants/paths";
import { auth } from "@/shared/lib/auth";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { isAdmin } from "@/server/auth/permissions";
import {
  changeForcedPasswordSchema,
  createProfessionalSchema,
  updateProfessionalSchema,
} from "./team.schema";
import {
  changeForcedPassword,
  createProfessional,
  listTeamMembers,
  updateProfessional,
} from "./team.service";
import type { CreatedProfessionalDTO, TeamMemberDTO } from "./team.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

export async function listTeamMembersAction(): Promise<
  ActionResult<TeamMemberDTO[]>
> {
  try {
    const { organizationId } = await requireOrgId();
    return ok(await listTeamMembers(organizationId));
  } catch (error) {
    return handleError(error);
  }
}

export async function createProfessionalAction(
  input: unknown,
): Promise<ActionResult<CreatedProfessionalDTO>> {
  try {
    const admin = await isAdmin();
    if (admin !== true) {
      return fail("Sem permissão para cadastrar profissionais");
    }

    const parsed = createProfessionalSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const { organizationId } = await requireOrgId();
    const data = await createProfessional(organizationId, parsed.data);
    revalidatePath(paths.profissionais);
    revalidatePath(paths.agenda);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function updateProfessionalAction(
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    const admin = await isAdmin();
    if (admin !== true) {
      return fail("Sem permissão para editar profissionais");
    }

    const parsed = updateProfessionalSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const { organizationId, userId } = await requireOrgId();
    await updateProfessional(organizationId, userId, parsed.data);
    revalidatePath(paths.profissionais);
    revalidatePath(paths.agenda);
    return ok(undefined);
  } catch (error) {
    return handleError(error);
  }
}

export async function changeForcedPasswordAction(
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    const parsed = changeForcedPasswordSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return fail("Sessão inválida. Faça login novamente.");
    }

    await changeForcedPassword(session.user.id, parsed.data.newPassword);
    return ok(undefined);
  } catch (error) {
    return handleError(error);
  }
}
