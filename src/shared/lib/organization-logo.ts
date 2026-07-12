export const ORGANIZATION_LOGO_UPLOAD_DIR = "uploads/organizations";

export const ORGANIZATION_LOGO_MAX_BYTES = 2 * 1024 * 1024;

export const ORGANIZATION_LOGO_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type OrganizationLogoMimeType =
  (typeof ORGANIZATION_LOGO_MIME_TYPES)[number];

export function isOrganizationLogoMimeType(
  mime: string,
): mime is OrganizationLogoMimeType {
  return ORGANIZATION_LOGO_MIME_TYPES.includes(
    mime as OrganizationLogoMimeType,
  );
}

export function isCustomOrganizationLogo(
  logoUrl: string | null | undefined,
): boolean {
  return Boolean(logoUrl?.includes(`/${ORGANIZATION_LOGO_UPLOAD_DIR}/`));
}

export function organizationLogoMimeToExtension(
  mime: OrganizationLogoMimeType,
): string {
  switch (mime) {
    case "image/png":
      return ".png";
    case "image/jpeg":
      return ".jpg";
    case "image/webp":
      return ".webp";
  }
}
