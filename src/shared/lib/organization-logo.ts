/**
 * Helpers de logo da clínica (seguros para client).
 * Persistência/processamento: `shared/lib/media`.
 */
import {
  MEDIA_KIND,
  MEDIA_UPLOAD_MIME_TYPES,
  MEDIA_UPLOADS_PREFIX,
  type MediaUploadMimeType,
} from "@/shared/lib/media/media.constants";

export const ORGANIZATION_LOGO_UPLOAD_DIR = `${MEDIA_UPLOADS_PREFIX}/organizations`;

export const ORGANIZATION_LOGO_MAX_BYTES = MEDIA_KIND.logo.maxUploadBytes;

export const ORGANIZATION_LOGO_MIME_TYPES = MEDIA_UPLOAD_MIME_TYPES;

export type OrganizationLogoMimeType = MediaUploadMimeType;

export function isOrganizationLogoMimeType(
  mime: string,
): mime is OrganizationLogoMimeType {
  return MEDIA_UPLOAD_MIME_TYPES.includes(mime as MediaUploadMimeType);
}

/** Logo enviada pela clínica (path local ou URL R2 com o mesmo key prefix). */
export function isCustomOrganizationLogo(
  logoUrl: string | null | undefined,
): boolean {
  if (!logoUrl) return false;
  return logoUrl.includes(`/${MEDIA_UPLOADS_PREFIX}/organizations/`);
}
