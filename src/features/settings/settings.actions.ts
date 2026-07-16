"use server";

import { revalidatePath } from "next/cache";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { fail, ok, type ActionResult } from "@/shared/types/action-result";
import {
  memberProfessionalSchema,
  organizationBrandingSchema,
  professionalProfileSchema,
} from "./settings.schema";
import {
  getCurrentMemberProfessionalProfile,
  getProfessionalProfile,
  getPrintBranding,
  removeOrganizationLogo,
  saveCurrentMemberProfessionalProfile,
  saveOrganizationBranding,
  saveOrganizationLogo,
  saveProfessionalProfile,
} from "./settings.service";
import type { PrintBranding, ProfessionalProfile } from "./settings.types";

function handleError(error: unknown): ActionResult<never> {
  if (error instanceof OrgContextError) return fail(error.message);
  if (error instanceof Error) return fail(error.message);
  console.error(error);
  return fail("Algo deu errado. Tente novamente.");
}

function revalidateBrandingPaths() {
  revalidatePath(paths.configuracoes);
  revalidatePath(paths.pacientes, "layout");
}

export async function getProfessionalAction(): Promise<
  ActionResult<ProfessionalProfile>
> {
  try {
    const { organizationId } = await requireOrgId();
    return ok(await getProfessionalProfile(organizationId));
  } catch (error) {
    return handleError(error);
  }
}

export async function getPrintBrandingAction(): Promise<
  ActionResult<PrintBranding>
> {
  try {
    const { organizationId } = await requireOrgId();
    return ok(await getPrintBranding(organizationId));
  } catch (error) {
    return handleError(error);
  }
}

export async function saveProfessionalAction(
  input: unknown,
): Promise<ActionResult<ProfessionalProfile>> {
  try {
    const parsed = professionalProfileSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const { organizationId } = await requireOrgId();
    const data = await saveProfessionalProfile(organizationId, parsed.data);
    revalidatePath(paths.painel);
    revalidatePath(paths.configuracoes);
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function getCurrentMemberProfessionalAction(): Promise<
  ActionResult<ProfessionalProfile>
> {
  try {
    const { organizationId, userId } = await requireOrgId();
    return ok(
      await getCurrentMemberProfessionalProfile(organizationId, userId),
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function saveCurrentMemberProfessionalAction(
  input: unknown,
): Promise<ActionResult<ProfessionalProfile>> {
  try {
    const parsed = memberProfessionalSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const { organizationId, userId } = await requireOrgId();
    const data = await saveCurrentMemberProfessionalProfile(
      organizationId,
      userId,
      parsed.data,
    );
    revalidatePath(paths.configuracoes);
    revalidatePath(paths.pacientes, "layout");
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function saveOrganizationBrandingAction(
  input: unknown,
): Promise<ActionResult<PrintBranding>> {
  try {
    const parsed = organizationBrandingSchema.safeParse(input);
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Dados inválidos");
    }
    const { organizationId } = await requireOrgId();
    const data = await saveOrganizationBranding(
      organizationId,
      parsed.data.clinicName,
    );
    revalidateBrandingPaths();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function uploadOrganizationLogoAction(
  formData: FormData,
): Promise<ActionResult<PrintBranding>> {
  try {
    const file = formData.get("logo");
    if (!(file instanceof File) || file.size === 0) {
      return fail("Selecione uma imagem");
    }

    const { organizationId } = await requireOrgId();
    const data = await saveOrganizationLogo(organizationId, file);
    revalidateBrandingPaths();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}

export async function removeOrganizationLogoAction(): Promise<
  ActionResult<PrintBranding>
> {
  try {
    const { organizationId } = await requireOrgId();
    const data = await removeOrganizationLogo(organizationId);
    revalidateBrandingPaths();
    return ok(data);
  } catch (error) {
    return handleError(error);
  }
}
