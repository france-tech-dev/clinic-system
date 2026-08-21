"use server";

import { db } from "@/shared/lib/prisma";
import { MemberStatus } from "../../../prisma/generated/prisma/enums";

export async function getActiveOrganization(userId: string) {
  const memberUser = await db.member.findFirst({
    where: {
      userId,
      status: MemberStatus.ACTIVE,
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
