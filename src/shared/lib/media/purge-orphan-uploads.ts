import "server-only";
import { MEDIA_UPLOADS_PREFIX } from "./media.constants";
import { getObjectStorage } from "./object-storage";

/** Extrai a key gerida (`uploads/...`) a partir de path local ou URL R2. */
export function managedKeyFromUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  const withoutQuery = url.split(/[?#]/, 1)[0] ?? url;
  const marker = `${MEDIA_UPLOADS_PREFIX}/`;
  const index = withoutQuery.indexOf(marker);
  if (index === -1) return null;
  const key = withoutQuery.slice(index);
  if (key.includes("..")) return null;
  return key;
}

export type PurgeOrphanManagedUploadsResult = {
  scanned: number;
  deleted: number;
};

/**
 * Apaga objectos em `uploads/` que já não estão referenciados nas URLs dadas
 * (ex. Organization.logo, User.image).
 */
export async function purgeOrphanManagedUploads(
  referencedUrls: Iterable<string | null | undefined>,
): Promise<PurgeOrphanManagedUploadsResult> {
  const referenced = new Set<string>();
  for (const url of referencedUrls) {
    const key = managedKeyFromUrl(url);
    if (key) referenced.add(key);
  }

  const storage = getObjectStorage();
  const keys = await storage.listKeys(MEDIA_UPLOADS_PREFIX);
  let deleted = 0;

  for (const key of keys) {
    if (referenced.has(key)) continue;
    await storage.deleteByKey(key);
    deleted += 1;
  }

  return { scanned: keys.length, deleted };
}
