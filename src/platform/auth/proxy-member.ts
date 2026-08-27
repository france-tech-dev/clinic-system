import { db } from "@/shared/lib/prisma";
import type { Role } from "@prisma/enums";

export type ProxyMemberGate = {
  role: Role;
  status: string;
};

export async function findProxyMember(
  userId: string,
  activeOrganizationId: string | null | undefined,
): Promise<ProxyMemberGate | null> {
  if (activeOrganizationId) {
    const active = await db.member.findFirst({
      where: { userId, organizationId: activeOrganizationId },
      select: { role: true, status: true },
    });
    if (active) return active;
  }

  return db.member.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { role: true, status: true },
  });
}
