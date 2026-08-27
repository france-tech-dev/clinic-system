import { env } from "@/shared/env";

export function getRedisUrl(): string | null {
  return env.REDIS_URL ?? null;
}
