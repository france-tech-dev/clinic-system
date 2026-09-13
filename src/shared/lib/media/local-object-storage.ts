import { mkdir, readdir, unlink, writeFile } from "fs/promises";
import path from "path";
import "server-only";
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

async function walkFiles(absoluteDir: string): Promise<string[]> {
  const entries = await readdir(absoluteDir, { withFileTypes: true }).catch(
    () => [],
  );
  const keys: string[] = [];

  for (const entry of entries) {
    const absolute = path.join(absoluteDir, entry.name);
    if (entry.isDirectory()) {
      keys.push(...(await walkFiles(absolute)));
      continue;
    }
    if (!entry.isFile()) continue;
    const relative = path
      .relative(publicRoot(), absolute)
      .split(path.sep)
      .join("/");
    keys.push(relative);
  }

  return keys;
}

export function createLocalObjectStorage(): ObjectStorage {
  async function deleteByKey(key: string) {
    assertKey(key);
    const absolute = path.join(publicRoot(), key);
    if (!absolute.startsWith(uploadsRoot())) return;
    try {
      await unlink(absolute);
    } catch {
      console.warn(`File already removed: ${absolute}`);
    }
  }

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
      await deleteByKey(url.replace(/^\//, ""));
    },

    deleteByKey,

    async listKeys(prefix = MEDIA_UPLOADS_PREFIX) {
      if (
        !prefix.startsWith(MEDIA_UPLOADS_PREFIX) ||
        prefix.includes("..") ||
        path.isAbsolute(prefix)
      ) {
        throw new Error("Prefixo de listagem inválido.");
      }
      const absolute = path.join(publicRoot(), prefix);
      const keys = await walkFiles(absolute);
      return keys.filter((key) => key.startsWith(`${MEDIA_UPLOADS_PREFIX}/`));
    },

    isManagedUrl: isLocalManagedUrl,
  };
}
