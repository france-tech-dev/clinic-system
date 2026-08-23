import "server-only";
import { env } from "@/shared/env";
import { createLocalObjectStorage } from "./local-object-storage";
import type { ObjectStorage } from "./object-storage.types";
import { createR2ObjectStorage } from "./r2-object-storage";

const globalForStorage = globalThis as unknown as {
  objectStorage?: ObjectStorage;
  objectStorageDriver?: string;
};

/** Singleton por processo; recria se o driver env mudar (dev). */
export function getObjectStorage(): ObjectStorage {
  const driver = env.OBJECT_STORAGE_DRIVER;
  if (
    globalForStorage.objectStorage &&
    globalForStorage.objectStorageDriver === driver
  ) {
    return globalForStorage.objectStorage;
  }

  const storage =
    driver === "r2" ? createR2ObjectStorage() : createLocalObjectStorage();

  globalForStorage.objectStorage = storage;
  globalForStorage.objectStorageDriver = driver;
  return storage;
}
