import "server-only";
import { env } from "@/shared/env";
import { MEDIA_UPLOADS_PREFIX } from "./media.constants";
import type { ObjectStorage, PutObjectInput } from "./object-storage.types";

export type R2ObjectStorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Base pública sem barra final, ex. https://cdn.exemplo.com */
  publicBaseUrl: string;
};

/** Só chamar com OBJECT_STORAGE_DRIVER=r2 (já validado no boot via env). */
export function readR2ObjectStorageConfig(): R2ObjectStorageConfig {
  if (env.OBJECT_STORAGE_DRIVER !== "r2") {
    throw new Error(
      "readR2ObjectStorageConfig só deve ser chamado com OBJECT_STORAGE_DRIVER=r2.",
    );
  }

  return {
    accountId: env.R2_ACCOUNT_ID as string,
    accessKeyId: env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
    bucket: env.R2_BUCKET as string,
    publicBaseUrl: (env.R2_PUBLIC_BASE_URL as string).replace(/\/$/, ""),
  };
}

/** Stub até ligar `@aws-sdk/client-s3` + PutObject/DeleteObject. */
export function createR2ObjectStorage(
  config: R2ObjectStorageConfig = readR2ObjectStorageConfig(),
): ObjectStorage {
  function isR2ManagedUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return (
      url.startsWith(`${config.publicBaseUrl}/`) &&
      url.includes(`/${MEDIA_UPLOADS_PREFIX}/`)
    );
  }

  return {
    async put(_input: PutObjectInput) {
      throw new Error(
        "R2 ainda não ligado. Instala `@aws-sdk/client-s3` e implementa put/deleteByUrl em r2-object-storage.ts.",
      );
    },

    async deleteByUrl(url: string) {
      if (!isR2ManagedUrl(url)) return;
      throw new Error(
        "R2 ainda não ligado. Instala `@aws-sdk/client-s3` e implementa put/deleteByUrl em r2-object-storage.ts.",
      );
    },

    isManagedUrl: isR2ManagedUrl,
  };
}
