import type { ProtocolInviteDTO } from "../protocol-invite.types";

export type InviteListFilter = "all" | "pending" | "responded" | "inactive";

/** Bucket de filtro na lista de links enviados. */
export function inviteListBucket(
  invite: ProtocolInviteDTO,
): Exclude<InviteListFilter, "all"> {
  if (invite.isRevoked || invite.isExpired) return "inactive";
  if (invite.allSubmitted) return "responded";
  return "pending";
}

export function filterInvites(
  invites: ProtocolInviteDTO[],
  filter: InviteListFilter,
): ProtocolInviteDTO[] {
  if (filter === "all") return invites;
  return invites.filter((invite) => inviteListBucket(invite) === filter);
}

export function countInviteBuckets(invites: ProtocolInviteDTO[]) {
  const counts = {
    all: invites.length,
    pending: 0,
    responded: 0,
    inactive: 0,
  };
  for (const invite of invites) {
    counts[inviteListBucket(invite)] += 1;
  }
  return counts;
}
