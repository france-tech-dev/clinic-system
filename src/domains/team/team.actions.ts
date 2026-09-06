"use server";

import { requirePermission } from "@/server/auth/permissions";
import { findProxyMember } from "@/server/auth/proxy-member";
import {
  requireOrgWrite,
  requireSeatAvailable,
} from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { auth } from "@/shared/lib/auth";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import {
  changeForcedPasswordSchema,
  createProfessionalSchema,
  deleteProfessionalSchema,
  memberPatientsSchema,
  updateOwnProfileSchema,
  updateProfessionalSchema,
} from "./team.schema";
import {
  changeForcedPassword,
  createProfessional,
  deleteProfessional,
  getOwnTeamMember,
  listTeamMembers,
  setMemberPatients,
  updateOwnProfile,
  updateProfessional,
} from "./team.service";
import type { CreatedProfessionalDTO, TeamMemberDTO } from "./team.types";

export async function listTeamMembersAction(): Promise<
  ActionResult<TeamMemberDTO[]>
> {
  try {
    await requirePermission({ project: ["read"] });

    const { organizationId } = await requireOrgId();
    return ok(await listTeamMembers(organizationId));
  } catch (error) {
    return AppError.result(error);
  }
}

export async function getOwnTeamMemberAction(): Promise<
  ActionResult<TeamMemberDTO>
> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId, userId } = await requireOrgId();
    const member = await getOwnTeamMember(organizationId, userId);
    if (!member) throw new AppError("Membro não encontrado nesta clínica");
    return ok(member);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updateOwnProfileAction(
  input: unknown,
): Promise<ActionResult<TeamMemberDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(updateOwnProfileSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const data = await updateOwnProfile(organizationId, userId, payload);
    revalidatePath(paths.perfil);
    revalidatePath(paths.profissionais);
    revalidatePath(paths.pacientes, "layout");
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function createProfessionalAction(
  input: unknown,
): Promise<ActionResult<CreatedProfessionalDTO>> {
  try {
    await requirePermission({ project: ["create"] });

    const payload = AppError.parse(createProfessionalSchema, input);

    const { organizationId } = await requireOrgWrite();
    await requireSeatAvailable(organizationId);
    const data = await createProfessional(organizationId, payload);
    revalidatePath(paths.profissionais);
    revalidatePath(paths.agenda);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function updateProfessionalAction(
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    await requirePermission({ project: ["update"] });

    const payload = AppError.parse(updateProfessionalSchema, input);

    const { organizationId, userId } = await requireOrgWrite();
    await updateProfessional(organizationId, userId, payload);
    revalidatePath(paths.profissionais);
    revalidatePath(paths.agenda);
    return ok(undefined);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function deleteProfessionalAction(
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    await requirePermission({ project: ["delete"] });

    const payload = AppError.parse(deleteProfessionalSchema, input);

    const { organizationId, userId } = await requireOrgWrite();
    await deleteProfessional(organizationId, userId, payload.memberId);
    revalidatePath(paths.profissionais);
    revalidatePath(paths.agenda);
    return ok(undefined);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function setMemberPatientsAction(
  input: unknown,
): Promise<ActionResult<TeamMemberDTO>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(memberPatientsSchema, input);

    const { organizationId, userId } = await requireOrgWrite();
    const member = await findProxyMember(userId, organizationId);
    if (!isLeadershipRole(member?.role ?? null)) {
      throw new Error("Sem permissão.");
    }

    const data = await setMemberPatients(
      organizationId,
      payload.memberId,
      payload.patientIds,
    );
    if (!data) throw new AppError("Profissional não encontrado");
    revalidatePath(paths.profissionais);
    revalidatePath(paths.pacientes, "layout");
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function changeForcedPasswordAction(
  input: unknown,
): Promise<ActionResult<void>> {
  try {
    const payload = AppError.parse(changeForcedPasswordSchema, input);

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      throw new AppError("Sessão inválida. Faça login novamente.");
    }

    await changeForcedPassword(session.user.id, payload.newPassword);
    await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
    return ok(undefined);
  } catch (error) {
    return AppError.result(error);
  }
}
