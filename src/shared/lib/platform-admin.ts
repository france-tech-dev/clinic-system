/** User ids com acesso a /plataforma (separados por vírgula). */
export function isPlatformAdminUserId(userId: string): boolean {
  const raw = process.env.PLATFORM_ADMIN_USER_IDS ?? "";
  if (!raw.trim()) return false;
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(userId);
}
