import "server-only";
import {
  isMediaUploadMimeType,
  MEDIA_KIND,
  organizationLogoKey,
  userAvatarKey,
  type MediaKind,
} from "./media.constants";
import { getObjectStorage } from "./object-storage";
import { processImageToWebp } from "./process-image";

async function saveProcessedImage(opts: {
  kind: MediaKind;
  key: string;
  file: File;
}): Promise<string> {
  if (!isMediaUploadMimeType(opts.file.type)) {
    throw new Error("Use PNG, JPEG ou WebP");
  }
  if (opts.file.size > MEDIA_KIND[opts.kind].maxUploadBytes) {
    throw new Error("A imagem deve ter no máximo 2 MB");
  }

  const input = Buffer.from(await opts.file.arrayBuffer());
  const processed = await processImageToWebp(input, opts.kind);
  const storage = getObjectStorage();
  const { url } = await storage.put({
    key: opts.key,
    body: processed.bytes,
    contentType: processed.contentType,
  });
  return url;
}

/** Logo da clínica → WebP, lado maior ≤ 1024. */
export async function saveOrganizationLogoImage(
  organizationId: string,
  file: File,
): Promise<string> {
  return saveProcessedImage({
    kind: "logo",
    key: organizationLogoKey(organizationId),
    file,
  });
}

/**
 * Avatar de utilizador (profissional / paciente portal) → WebP 256².
 * Pronto para ligar a `User.image` quando existir o fluxo de upload.
 */
export async function saveUserAvatarImage(
  userId: string,
  file: File,
): Promise<string> {
  return saveProcessedImage({
    kind: "avatar",
    key: userAvatarKey(userId),
    file,
  });
}

export async function deleteManagedImage(url: string): Promise<void> {
  await getObjectStorage().deleteByUrl(url);
}

export function isManagedMediaUrl(url: string | null | undefined): boolean {
  return getObjectStorage().isManagedUrl(url);
}
