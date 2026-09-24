import { env } from "@/shared/env";
import Redis from "ioredis";

let client: Redis | null = null;

export function getRedisUrl(): string {
  return env.REDIS_URL;
}

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });
  }
  return client;
}
