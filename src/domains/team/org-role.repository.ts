import { DEFAULT_ORG_ROLE_SLUGS } from "@/shared/constants/member-role";
import { db } from "@/shared/lib/prisma";
import { PRESET_ROLE_PERMISSIONS } from "./_lib/default-org-role-permissions";

export const orgRoleRepository = {
  async findMany(organizationId: string) {
    return db.organizationRole.findMany({
      where: { organizationId },
      orderBy: { createdAt: "asc" },
    });
  },

  async countMembersByRole(organizationId: string) {
    const rows = await db.member.groupBy({
      by: ["role"],
      where: { organizationId },
      _count: { _all: true },
    });
    return new Map(rows.map((r) => [r.role, r._count._all]));
  },

  async countMembersWithRole(organizationId: string, role: string) {
    return db.member.count({
      where: { organizationId, role },
    });
  },

  /** Seed ADMIN/MANAGER/MEMBER se ainda não existirem. */
  async ensureDefaults(organizationId: string) {
    await db.organizationRole.createMany({
      data: DEFAULT_ORG_ROLE_SLUGS.map((slug) => ({
        organizationId,
        role: slug,
        permission: JSON.stringify(PRESET_ROLE_PERMISSIONS[slug] ?? {}),
      })),
      skipDuplicates: true,
    });
  },

  async findByRole(organizationId: string, role: string) {
    return db.organizationRole.findFirst({
      where: { organizationId, role },
    });
  },
};
