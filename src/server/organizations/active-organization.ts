"use server";

import { db } from "@/shared/lib/prisma";

export async function getActiveOrganization(userId: string) {
  const memberUser = await db.member.findFirst({
    where: {
      userId,
      status: "active",
    },
  });

  if (!memberUser) {
    return null;
  }

  const activeOrganization = await db.organization.findFirst({
    where: {
      id: memberUser.organizationId,
    },
  });
  return activeOrganization;
}
