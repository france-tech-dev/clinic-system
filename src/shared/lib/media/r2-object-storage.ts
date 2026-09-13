import { env } from "@/shared/env";
import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import "server-only";
import { MEDIA_UPLOADS_PREFIX } from "./media.constants";
import type { ObjectStorage, PutObjectInput } from "./object-storage.types";

export type R2ObjectStorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Base pública sem barra final, ex. https://r2.francetech.com.br */
  publicBaseUrl: string;
};

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

function assertKey(key: string): void {
  if (!key.startsWith(`${MEDIA_UPLOADS_PREFIX}/`) || key.includes("..")) {
    throw new Error("Chave de ficheiro inválida.");
  }
}

export function createR2ObjectStorage(
  config: R2ObjectStorageConfig = readR2ObjectStorageConfig(),
): ObjectStorage {
  const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
  });

  function isR2ManagedUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    const path = url.split(/[?#]/, 1)[0] ?? url;
    return (
      path.startsWith(`${config.publicBaseUrl}/`) &&
      path.includes(`/${MEDIA_UPLOADS_PREFIX}/`)
    );
  }

  async function deleteByKey(key: string) {
    assertKey(key);
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: config.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      console.warn(`R2 delete failed for ${key}:`, error);
    }
  }

  return {
    async put(input: PutObjectInput) {
      assertKey(input.key);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: input.key,
          Body: input.body,
          ContentType: input.contentType,
          CacheControl: "public, max-age=604800",
        }),
      );

      return { url: `${config.publicBaseUrl}/${input.key}` };
    },

    async deleteByUrl(url: string) {
      if (!isR2ManagedUrl(url)) return;
      const path = url.split(/[?#]/, 1)[0] ?? url;
      const key = path.slice(`${config.publicBaseUrl}/`.length);
      await deleteByKey(key);
    },

    deleteByKey,

    async listKeys(prefix = MEDIA_UPLOADS_PREFIX) {
      if (!prefix.startsWith(MEDIA_UPLOADS_PREFIX) || prefix.includes("..")) {
        throw new Error("Prefixo de listagem inválido.");
      }

      const keys: string[] = [];
      let continuationToken: string | undefined;

      do {
        const page = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: config.bucket,
            Prefix: prefix.endsWith("/") ? prefix : `${prefix}/`,
            ContinuationToken: continuationToken,
          }),
        );

        for (const item of page.Contents ?? []) {
          if (!item.Key || item.Key.endsWith("/")) continue;
          keys.push(item.Key);
        }

        continuationToken = page.IsTruncated
          ? page.NextContinuationToken
          : undefined;
      } while (continuationToken);

      return keys;
    },

    isManagedUrl: isR2ManagedUrl,
  };
}
