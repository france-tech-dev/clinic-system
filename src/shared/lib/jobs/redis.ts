/**
 * Returns Redis URL or null if not configured.
 * Uses process.env directly so importing this module does not require full env validation.
 */
export function getRedisUrl(): string | null {
  const url = process.env.REDIS_URL?.trim();
  return url || null;
}
