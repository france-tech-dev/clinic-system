import "server-only";

export type PutObjectInput = {
  /** Path relativo estável, ex. uploads/organizations/{id}/logo.webp */
  key: string;
  body: Buffer;
  contentType: string;
};

export type PutObjectResult = {
  /** URL pública a guardar na BD (path local ou URL R2). */
  url: string;
};

export type ObjectStorage = {
  put(input: PutObjectInput): Promise<PutObjectResult>;
  deleteByUrl(url: string): Promise<void>;
  isManagedUrl(url: string | null | undefined): boolean;
};

export type ObjectStorageDriver = "local" | "r2";
