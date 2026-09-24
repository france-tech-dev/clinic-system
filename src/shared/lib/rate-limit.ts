import { getRedis } from "@/shared/lib/redis";
import "server-only";

export type RateLimitResult =
  { ok: true } | { ok: false; retryAfterSec: number };

const KEY_PREFIX = "rate-limit:";

function redisKey(key: string): string {
  return `${KEY_PREFIX}${key}`;
}

export async function consumeRateLimit(
  key: string,
  rule: { windowSec: number; max: number },
): Promise<{ allowed: boolean; retryAfter: number | null }> {
  const redis = getRedis();
  const k = redisKey(key);
  const count = await redis.incr(k);

  if (count === 1) {
    await redis.expire(k, rule.windowSec);
  }

  if (count > rule.max) {
    const ttl = await redis.ttl(k);
    return {
      allowed: false,
      retryAfter: Math.max(1, ttl > 0 ? ttl : rule.windowSec),
    };
  }

  return { allowed: true, retryAfter: null };
}

export async function assertRateLimit(opts: {
  key: string;
  windowSec: number;
  max: number;
}): Promise<RateLimitResult> {
  const result = await consumeRateLimit(opts.key, {
    windowSec: opts.windowSec,
    max: opts.max,
  });

  if (result.allowed) return { ok: true };

  return {
    ok: false,
    retryAfterSec: result.retryAfter ?? opts.windowSec,
  };
}

export function getRequestClientIp(headersList: Headers): string {
  const realIp = headersList.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return "unknown";
}
