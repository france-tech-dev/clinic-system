import { db } from "@/shared/lib/prisma";
import {
  EMPTY_PROFESSIONAL,
  type ClinicSettings,
  type ProfessionalProfile,
} from "./settings.types";

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

export async function getProfessionalProfile(
  organizationId: string,
): Promise<ProfessionalProfile> {
  const org = await db.organization.findFirst({
    where: { id: organizationId },
    select: { metadata: true },
  });
  const meta = parseMeta(org?.metadata);
  return meta.fichario?.professional ?? { ...EMPTY_PROFESSIONAL };
}

export async function saveProfessionalProfile(
  organizationId: string,
  professional: ProfessionalProfile,
): Promise<ProfessionalProfile> {
  const org = await db.organization.findFirst({
    where: { id: organizationId },
    select: { metadata: true },
  });
  if (!org) throw new Error("Organização não encontrada");

  const meta = parseMeta(org.metadata);
  meta.fichario = {
    ...(meta.fichario ?? { professional: EMPTY_PROFESSIONAL }),
    professional,
  };

  await db.organization.update({
    where: { id: organizationId },
    data: { metadata: JSON.stringify(meta) },
  });

  return professional;
}
