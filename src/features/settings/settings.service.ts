import {
  DEFAULT_APP_NAME,
  DEFAULT_PRINT_LOGO,
} from "@/shared/constants/brand";
import {
  deleteOrganizationLogoFile,
  saveOrganizationLogoFile,
} from "@/shared/lib/organization-logo-storage";
import {
  isCustomOrganizationLogo,
  isOrganizationLogoMimeType,
  ORGANIZATION_LOGO_MAX_BYTES,
} from "@/shared/lib/organization-logo";
import {
  EMPTY_PROFESSIONAL,
  memberToProfessionalProfile,
  serializeMemberProfessionalMetadata,
  type ClinicSettings,
  type PrintBranding,
  type ProfessionalProfile,
} from "./settings.types";
import { settingsRepository } from "./settings.repository";

type OrgMeta = {
  fichario?: ClinicSettings;
  [key: string]: unknown;
};

function parseMeta(raw: string | null | undefined): OrgMeta {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as OrgMeta;
  } catch {
    return {};
  }
}

function buildPrintBranding(
  org: { name: string; logo: string | null } | null,
): PrintBranding {
  return {
    clinicName: org?.name?.trim() || DEFAULT_APP_NAME,
    logoUrl: org?.logo?.trim() || DEFAULT_PRINT_LOGO,
  };
}

export async function getProfessionalProfile(
  organizationId: string,
): Promise<ProfessionalProfile> {
  const org = await settingsRepository.findOrganizationBranding(organizationId);
  const meta = parseMeta(org?.metadata);
  return meta.fichario?.professional ?? { ...EMPTY_PROFESSIONAL };
}

export async function saveProfessionalProfile(
  organizationId: string,
  professional: ProfessionalProfile,
): Promise<ProfessionalProfile> {
  const org = await settingsRepository.findOrganizationBranding(organizationId);
  if (!org) throw new Error("Organização não encontrada");

  const meta = parseMeta(org.metadata);
  meta.fichario = {
    ...(meta.fichario ?? { professional: EMPTY_PROFESSIONAL }),
    professional,
  };

  await settingsRepository.updateOrganizationMetadata(
    organizationId,
    JSON.stringify(meta),
  );

  return professional;
}

export async function getCurrentMemberProfessionalProfile(
  organizationId: string,
  userId: string,
): Promise<ProfessionalProfile> {
  const member = await settingsRepository.findMemberByUserId(
    organizationId,
    userId,
  );
  if (!member) return { ...EMPTY_PROFESSIONAL };
  return (
    memberToProfessionalProfile(
      member.metadata,
      member.user.name,
      member.registration,
    ) ?? {
      name: member.user.name?.trim() || "",
      registration: member.registration?.trim() || "",
      clinic: "",
    }
  );
}

export async function saveCurrentMemberProfessionalProfile(
  organizationId: string,
  userId: string,
  professional: Pick<ProfessionalProfile, "name" | "registration">,
): Promise<ProfessionalProfile> {
  const member = await settingsRepository.findMemberByUserId(
    organizationId,
    userId,
  );
  if (!member) throw new Error("Membro não encontrado na organização");

  const metadata = serializeMemberProfessionalMetadata(
    { name: professional.name, registration: professional.registration },
    member.metadata,
  );
  const updated = await settingsRepository.updateMemberProfessional(
    organizationId,
    member.id,
    {
      metadata,
      registration: professional.registration.trim(),
    },
  );
  if (!updated) throw new Error("Não foi possível salvar o perfil");

  return (
    memberToProfessionalProfile(
      updated.metadata,
      updated.user.name,
      updated.registration,
    ) ?? {
      name: professional.name,
      registration: professional.registration,
      clinic: "",
    }
  );
}

export async function getPrintBranding(
  organizationId: string,
): Promise<PrintBranding> {
  const org = await settingsRepository.findOrganizationBranding(organizationId);
  return buildPrintBranding(org);
}

export async function saveOrganizationBranding(
  organizationId: string,
  clinicName: string,
): Promise<PrintBranding> {
  const org = await settingsRepository.findOrganizationBranding(organizationId);
  if (!org) throw new Error("Organização não encontrada");

  const updated = await settingsRepository.updateOrganizationName(
    organizationId,
    clinicName,
  );

  return buildPrintBranding(updated);
}

export async function saveOrganizationLogo(
  organizationId: string,
  file: File,
): Promise<PrintBranding> {
  if (!isOrganizationLogoMimeType(file.type)) {
    throw new Error("Use PNG, JPEG ou WebP");
  }
  if (file.size > ORGANIZATION_LOGO_MAX_BYTES) {
    throw new Error("A imagem deve ter no máximo 2 MB");
  }

  const org = await settingsRepository.findOrganizationBranding(organizationId);
  if (!org) throw new Error("Organização não encontrada");

  const bytes = Buffer.from(await file.arrayBuffer());
  const logoUrl = await saveOrganizationLogoFile(
    organizationId,
    bytes,
    file.type,
  );

  const previousLogo = org.logo?.trim() ?? "";
  const updated = await settingsRepository.updateOrganizationLogo(
    organizationId,
    logoUrl,
  );

  if (isCustomOrganizationLogo(previousLogo) && previousLogo !== logoUrl) {
    await deleteOrganizationLogoFile(previousLogo);
  }

  return buildPrintBranding(updated);
}

export async function removeOrganizationLogo(
  organizationId: string,
): Promise<PrintBranding> {
  const org = await settingsRepository.findOrganizationBranding(organizationId);
  if (!org) throw new Error("Organização não encontrada");

  const previousLogo = org.logo?.trim() ?? "";
  const updated = await settingsRepository.updateOrganizationLogo(
    organizationId,
    null,
  );

  if (isCustomOrganizationLogo(previousLogo)) {
    await deleteOrganizationLogoFile(previousLogo);
  }

  return buildPrintBranding(updated);
}
