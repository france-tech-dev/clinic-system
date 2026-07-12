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
  org: { name: string; logo: string | null; metadata: string | null } | null,
): PrintBranding {
  const meta = parseMeta(org?.metadata);
  const clinicFromProfile = meta.fichario?.professional?.clinica?.trim();

  return {
    clinicName: org?.name?.trim() || clinicFromProfile || DEFAULT_APP_NAME,
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
