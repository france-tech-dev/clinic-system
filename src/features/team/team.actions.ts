"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { paths } from "@/shared/constants/paths";
import { auth } from "@/shared/lib/auth";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import { hasOrgPermission } from "@/server/auth/permissions";
import {
  changeForcedPasswordSchema,
  createProfessionalSchema,
  deleteProfessionalSchema,
  updateProfessionalSchema,
} from "./team.schema";
import {
  changeForcedPassword,
  createProfessional,
  deleteProfessional,
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
    if (!(await hasOrgPermission({ member: ["create"] }))) {
      return fail("Sem permissão para cadastrar profissionais");
    }

    const parsed = createProfessionalSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
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
    if (!(await hasOrgPermission({ member: ["update"] }))) {
      return fail("Sem permissão para editar profissionais");
    }

    const parsed = updateProfessionalSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
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

export async function deleteProfessionalAction(
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    if (!(await hasOrgPermission({ member: ["delete"] }))) {
      return fail("Sem permissão para excluir profissionais");
    }

    const parsed = deleteProfessionalSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }

    const { organizationId, userId } = await requireOrgId();
    await deleteProfessional(organizationId, userId, parsed.data.memberId);
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
      return failZod(parsed.error);
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
