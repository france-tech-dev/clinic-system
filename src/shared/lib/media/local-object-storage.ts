import "server-only";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { MEDIA_UPLOADS_PREFIX } from "./media.constants";
import type { ObjectStorage, PutObjectInput } from "./object-storage.types";

function publicRoot(): string {
  return path.join(process.cwd(), "public");
}

function uploadsRoot(): string {
  return path.join(publicRoot(), MEDIA_UPLOADS_PREFIX);
}

function assertKey(key: string): void {
  if (
    !key.startsWith(`${MEDIA_UPLOADS_PREFIX}/`) ||
    key.includes("..") ||
    path.isAbsolute(key)
  ) {
    throw new Error("Chave de ficheiro inválida.");
  }
}

function isLocalManagedUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith(`/${MEDIA_UPLOADS_PREFIX}/`) ||
    url.startsWith(`${MEDIA_UPLOADS_PREFIX}/`)
  );
}

export function createLocalObjectStorage(): ObjectStorage {
  return {
    async put(input: PutObjectInput) {
      assertKey(input.key);
      const absolute = path.join(publicRoot(), input.key);
      await mkdir(path.dirname(absolute), { recursive: true });
      await writeFile(absolute, input.body);
      return { url: `/${input.key}` };
    },

    async deleteByUrl(url: string) {
      if (!isLocalManagedUrl(url)) return;
      const relative = url.replace(/^\//, "");
      assertKey(relative);
      const absolute = path.join(publicRoot(), relative);
      if (!absolute.startsWith(uploadsRoot())) return;
      try {
        await unlink(absolute);
      } catch {
        console.warn(`File already removed: ${absolute}`);
      }
    },

    isManagedUrl: isLocalManagedUrl,
  };
}
