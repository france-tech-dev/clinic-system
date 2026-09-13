/** Política de imagens geridas (local ou R2 via OBJECT_STORAGE_DRIVER). */

export const MEDIA_OUTPUT_MIME = "image/webp" as const;
export const MEDIA_OUTPUT_EXTENSION = ".webp" as const;

export const MEDIA_UPLOAD_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export type MediaUploadMimeType = (typeof MEDIA_UPLOAD_MIME_TYPES)[number];

export type MediaKind = "avatar" | "logo";

/** Original no picker (fotos de telemóvel). */
export const MEDIA_MAX_SOURCE_BYTES = 20 * 1024 * 1024;

/** Após resize no cliente; alinhado ao default das Server Actions (~1 MB). */
export const MEDIA_MAX_UPLOAD_BYTES = 1 * 1024 * 1024;

export const MEDIA_KIND = {
  avatar: {
    sizePx: 256,
    square: true,
    webpQuality: 82,
  },
  logo: {
    sizePx: 1024,
    square: false,
    webpQuality: 85,
  },
} as const satisfies Record<
  MediaKind,
  { sizePx: number; square: boolean; webpQuality: number }
>;

export function mediaMaxBytesError(maxBytes: number): string {
  return `A imagem deve ter no máximo ${maxBytes / (1024 * 1024)} MB`;
}

/** Prefixo local em /public e key prefix no R2. */
export const MEDIA_UPLOADS_PREFIX = "uploads";

export type ManagedUploadScope = "organizations" | "avatars" | "patients";

export function isManagedUploadUrl(
  url: string | null | undefined,
  scope: ManagedUploadScope,
): boolean {
  if (!url) return false;
  return url.includes(`/${MEDIA_UPLOADS_PREFIX}/${scope}/`);
}

export function isMediaUploadMimeType(
  mime: string,
): mime is MediaUploadMimeType {
  return MEDIA_UPLOAD_MIME_TYPES.includes(mime as MediaUploadMimeType);
}

export function organizationLogoKey(organizationId: string): string {
  return `${MEDIA_UPLOADS_PREFIX}/organizations/${organizationId}/logo${MEDIA_OUTPUT_EXTENSION}`;
}

export function userAvatarKey(userId: string): string {
  return `${MEDIA_UPLOADS_PREFIX}/avatars/${userId}${MEDIA_OUTPUT_EXTENSION}`;
}

export function patientPhotoKey(patientId: string): string {
  return `${MEDIA_UPLOADS_PREFIX}/patients/${patientId}${MEDIA_OUTPUT_EXTENSION}`;
}
