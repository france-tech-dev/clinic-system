import "server-only";
import { MEDIA_UPLOADS_PREFIX } from "./media.constants";
import type { ObjectStorage, PutObjectInput } from "./object-storage.types";

export type R2ObjectStorageConfig = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  /** Base pública sem barra final, ex. https://cdn.exemplo.com ou https://pub-xxx.r2.dev */
  publicBaseUrl: string;
};

/**
 * Lê env do R2. Só chamado quando OBJECT_STORAGE_DRIVER=r2.
 *
 * Variáveis:
 * - R2_ACCOUNT_ID
 * - R2_ACCESS_KEY_ID
 * - R2_SECRET_ACCESS_KEY
 * - R2_BUCKET
 * - R2_PUBLIC_BASE_URL
 */
export function readR2ObjectStorageConfig(): R2ObjectStorageConfig {
  const accountId = process.env.R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucket = process.env.R2_BUCKET?.trim() ?? "";
  const publicBaseUrl = (process.env.R2_PUBLIC_BASE_URL?.trim() ?? "").replace(
    /\/$/,
    "",
  );

  const missing = [
    !accountId && "R2_ACCOUNT_ID",
    !accessKeyId && "R2_ACCESS_KEY_ID",
    !secretAccessKey && "R2_SECRET_ACCESS_KEY",
    !bucket && "R2_BUCKET",
    !publicBaseUrl && "R2_PUBLIC_BASE_URL",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Object storage R2 incompleto. Define: ${missing.join(", ")}.`,
    );
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl,
  };
}

/**
 * Driver R2 (S3-compatible).
 *
 * Activação:
 * 1. `pnpm add @aws-sdk/client-s3`
 * 2. `OBJECT_STORAGE_DRIVER=r2` + variáveis R2_*
 * 3. Substituir o corpo de `put`/`deleteByUrl` pela implementação S3
 *    (PutObject / DeleteObject) — ver comentários abaixo.
 *
 * Mantido sem SDK até ligares o R2, para não pesar o bundle.
 */
export function createR2ObjectStorage(
  config: R2ObjectStorageConfig = readR2ObjectStorageConfig(),
): ObjectStorage {
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;

  function isR2ManagedUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return (
      url.startsWith(`${config.publicBaseUrl}/`) &&
      url.includes(`/${MEDIA_UPLOADS_PREFIX}/`)
    );
  }

  return {
    async put(input: PutObjectInput) {
      void endpoint;
      void input;
      /*
        const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
        const client = new S3Client({
          region: "auto",
          endpoint,
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        });
        await client.send(
          new PutObjectCommand({
            Bucket: config.bucket,
            Key: input.key,
            Body: input.body,
            ContentType: input.contentType,
          }),
        );
        return { url: `${config.publicBaseUrl}/${input.key}` };
      */
      throw new Error(
        "R2 ainda não ligado. Instala `@aws-sdk/client-s3` e activa o código em `r2-object-storage.ts` (funções put/deleteByUrl).",
      );
    },

    async deleteByUrl(url: string) {
      if (!isR2ManagedUrl(url)) return;
      void endpoint;
      void url;
      /*
        const key = url.slice(config.publicBaseUrl.length + 1);
        const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
        ...
        await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
      */
      throw new Error(
        "R2 ainda não ligado. Instala `@aws-sdk/client-s3` e activa o código em `r2-object-storage.ts`.",
      );
    },

    isManagedUrl: isR2ManagedUrl,
  };
}
