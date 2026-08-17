"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requirePermission } from "@/server/auth/permissions";
import { findProxyMember } from "@/server/auth/proxy-member";
import {
  requireOrgWrite,
  requireSeatAvailable,
} from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { auth } from "@/shared/lib/auth";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { failZod } from "@/shared/lib/zod-field-errors";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  changeForcedPasswordSchema,
  createProfessionalSchema,
  deleteProfessionalSchema,
  memberPatientsSchema,
  updateProfessionalSchema,
} from "./team.schema";
import {
  changeForcedPassword,
  createProfessional,
  deleteProfessional,
  listTeamMembers,
  setMemberPatients,
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
    await requirePermission({ project: ["read"] });

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
    await requirePermission({ project: ["create"] });

    const parsed = createProfessionalSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }

    const { organizationId } = await requireOrgWrite();
    await requireSeatAvailable(organizationId);
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
    await requirePermission({ project: ["update"] });

    const parsed = updateProfessionalSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }

    const { organizationId, userId } = await requireOrgWrite();
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
    await requirePermission({ project: ["delete"] });

    const parsed = deleteProfessionalSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }

    const { organizationId, userId } = await requireOrgWrite();
    await deleteProfessional(organizationId, userId, parsed.data.memberId);
    revalidatePath(paths.profissionais);
    revalidatePath(paths.agenda);
    return ok(undefined);
  } catch (error) {
    return handleError(error);
  }
}

export async function setMemberPatientsAction(
  input: unknown,
): Promise<ActionResult<TeamMemberDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const parsed = memberPatientsSchema.safeParse(input);
    if (!parsed.success) {
      return failZod(parsed.error);
    }

    const { organizationId, userId } = await requireOrgWrite();
    const member = await findProxyMember(userId, organizationId);
    if (!isLeadershipRole(member?.role ?? null)) {
      throw new Error("Sem permissão.");
    }

    const data = await setMemberPatients(
      organizationId,
      parsed.data.memberId,
      parsed.data.patientIds,
    );
    if (!data) return fail("Profissional não encontrado");
    revalidatePath(paths.profissionais);
    revalidatePath(paths.pacientes, "layout");
    return ok(data);
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
    await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
    return ok(undefined);
  } catch (error) {
    return handleError(error);
  }
}
