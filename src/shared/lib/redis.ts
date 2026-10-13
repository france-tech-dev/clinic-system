import { env } from "@/shared/env";
import Redis from "ioredis";

let client: Redis | null = null;

export function getRedisUrl(): string {
  const url = env.REDIS_URL?.trim();
  if (!url) throw new Error("REDIS_URL não configurada");
  return url;
}

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });
    // Sem listener = Unhandled error event em loop quando Redis cai
    client.on("error", () => {});
  }
  return client;
}
