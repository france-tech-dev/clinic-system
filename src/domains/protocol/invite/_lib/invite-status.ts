export function isInviteExpired(
  expiresAt: Date | null,
  now = new Date(),
): boolean {
  return expiresAt != null && expiresAt.getTime() < now.getTime();
}

export function computeInviteFlags(input: {
  revokedAt: Date | null;
  expiresAt: Date | null;
  itemStatuses: readonly string[];
}, now = new Date()) {
  const isRevoked = input.revokedAt != null;
  const isExpired = isInviteExpired(input.expiresAt, now);
  const allSubmitted = input.itemStatuses.every((s) => s === "submitted");
  return {
    isRevoked,
    isExpired,
    allSubmitted,
    isActive: !isRevoked && !isExpired,
  };
}
