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

export const MEDIA_KIND = {
  avatar: {
    /** Lado do quadrado (crop cover). */
    sizePx: 256,
    square: true,
    maxUploadBytes: 5 * 1024 * 1024,
    webpQuality: 82,
  },
  logo: {
    /** Lado maior (fit inside, sem upscale). */
    sizePx: 1024,
    square: false,
    maxUploadBytes: 5 * 1024 * 1024,
    webpQuality: 85,
  },
} as const satisfies Record<
  MediaKind,
  {
    sizePx: number;
    square: boolean;
    maxUploadBytes: number;
    webpQuality: number;
  }
>;

export function mediaMaxUploadError(kind: MediaKind): string {
  const mb = MEDIA_KIND[kind].maxUploadBytes / (1024 * 1024);
  return `A imagem deve ter no máximo ${mb} MB`;
}

/** Prefixo local em /public e key prefix no R2. */
export const MEDIA_UPLOADS_PREFIX = "uploads";

export type ManagedUploadScope = "organizations" | "avatars" | "patients";

/** URL gerida pela app (path local ou R2) para um scope de upload. */
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
