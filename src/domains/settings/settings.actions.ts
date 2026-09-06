"use server";

import { requirePermission } from "@/server/auth/permissions";
import { findProxyMember } from "@/server/auth/proxy-member";
import { requireOrgWrite } from "@/server/billing/require-billing";
import { paths } from "@/shared/constants/paths";
import { AppError } from "@/shared/lib/app-error";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { requireOrgId } from "@/shared/lib/org-context";
import { ok, type ActionResult } from "@/shared/types/action-result";
import { revalidatePath } from "next/cache";
import {
  memberProfessionalSchema,
  organizationBrandingSchema,
  professionalProfileSchema,
} from "./settings.schema";
import {
  getCurrentMemberProfessionalProfile,
  getPrintBranding,
  getProfessionalProfile,
  removeOrganizationLogo,
  saveCurrentMemberProfessionalProfile,
  saveOrganizationBranding,
  saveOrganizationLogo,
  saveProfessionalProfile,
} from "./settings.service";
import type { PrintBranding, ProfessionalProfile } from "./settings.types";

async function requireLeadershipWrite() {
  const { organizationId, userId } = await requireOrgWrite();
  const member = await findProxyMember(userId, organizationId);
  if (!isLeadershipRole(member?.role ?? null)) {
    throw new Error("Sem permissão.");
  }
  return { organizationId, userId };
}

function revalidateBrandingPaths() {
  revalidatePath(paths.configuracoes);
  revalidatePath(paths.pacientes, "layout");
}

export async function getProfessionalAction(): Promise<
  ActionResult<ProfessionalProfile>
> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    return ok(await getProfessionalProfile(organizationId));
  } catch (error) {
    return AppError.result(error);
  }
}

export async function getPrintBrandingAction(): Promise<
  ActionResult<PrintBranding>
> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId } = await requireOrgId();
    return ok(await getPrintBranding(organizationId));
  } catch (error) {
    return AppError.result(error);
  }
}

export async function saveProfessionalAction(
  input: unknown,
): Promise<ActionResult<ProfessionalProfile>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(professionalProfileSchema, input);
    const { organizationId } = await requireLeadershipWrite();
    const data = await saveProfessionalProfile(organizationId, payload);
    revalidatePath(paths.dashboard);
    revalidatePath(paths.configuracoes);
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function getCurrentMemberProfessionalAction(): Promise<
  ActionResult<ProfessionalProfile>
> {
  try {
    await requirePermission({ project: ["read"] });
    const { organizationId, userId } = await requireOrgId();
    return ok(
      await getCurrentMemberProfessionalProfile(organizationId, userId),
    );
  } catch (error) {
    return AppError.result(error);
  }
}

export async function saveCurrentMemberProfessionalAction(
  input: unknown,
): Promise<ActionResult<ProfessionalProfile>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(memberProfessionalSchema, input);
    const { organizationId, userId } = await requireOrgWrite();
    const data = await saveCurrentMemberProfessionalProfile(
      organizationId,
      userId,
      payload,
    );
    revalidatePath(paths.perfil);
    revalidatePath(paths.pacientes, "layout");
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function saveOrganizationBrandingAction(
  input: unknown,
): Promise<ActionResult<PrintBranding>> {
  try {
    await requirePermission({ project: ["update"] });
    const payload = AppError.parse(organizationBrandingSchema, input);
    const { organizationId } = await requireLeadershipWrite();
    const data = await saveOrganizationBranding(
      organizationId,
      payload.clinicName,
    );
    revalidateBrandingPaths();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function uploadOrganizationLogoAction(
  formData: FormData,
): Promise<ActionResult<PrintBranding>> {
  try {
    await requirePermission({ project: ["update"] });
    const file = formData.get("logo");
    if (!(file instanceof File) || file.size === 0) {
      throw new AppError("Selecione uma imagem");
    }

    const { organizationId } = await requireLeadershipWrite();
    const data = await saveOrganizationLogo(organizationId, file);
    revalidateBrandingPaths();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}

export async function removeOrganizationLogoAction(): Promise<
  ActionResult<PrintBranding>
> {
  try {
    await requirePermission({ project: ["update"] });
    const { organizationId } = await requireLeadershipWrite();
    const data = await removeOrganizationLogo(organizationId);
    revalidateBrandingPaths();
    return ok(data);
  } catch (error) {
    return AppError.result(error);
  }
}
