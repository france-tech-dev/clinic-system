import "server-only";
import { db } from "@/shared/lib/prisma";

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

/**
 * Rate limit simples por chave (IP, userId, etc.) na mesma tabela do Better Auth.
 * Para superfícies que `auth.api.*` não cobre (ex.: accept-invitation).
 */
export async function assertRateLimit(opts: {
  key: string;
  windowSec: number;
  max: number;
}): Promise<RateLimitResult> {
  const { key, windowSec, max } = opts;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const existing = await db.rateLimit.findUnique({ where: { key } });

  if (!existing) {
    try {
      await db.rateLimit.create({
        data: {
          key,
          count: 1,
          lastRequest: BigInt(now),
        },
      });
      return { ok: true };
    } catch {
      // corrida na criação — reavaliar
      return assertRateLimit(opts);
    }
  }

  const lastRequest = Number(existing.lastRequest);

  if (now - lastRequest > windowMs) {
    await db.rateLimit.update({
      where: { key },
      data: { count: 1, lastRequest: BigInt(now) },
    });
    return { ok: true };
  }

  if (existing.count >= max) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((lastRequest + windowMs - now) / 1000),
    );
    return { ok: false, retryAfterSec };
  }

  await db.rateLimit.update({
    where: { key },
    data: {
      count: { increment: 1 },
      lastRequest: BigInt(now),
    },
  });
  return { ok: true };
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
