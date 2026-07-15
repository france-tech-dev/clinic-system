import { db } from "@/shared/lib/prisma";

const brandingSelect = {
  name: true,
  logo: true,
  metadata: true,
} as const;

export const settingsRepository = {
  async findOrganizationBranding(organizationId: string) {
    return db.organization.findFirst({
      where: { id: organizationId },
      select: brandingSelect,
    });
  },

  async updateOrganizationName(organizationId: string, name: string) {
    return db.organization.update({
      where: { id: organizationId },
      data: { name },
      select: brandingSelect,
    });
  },

  async updateOrganizationLogo(organizationId: string, logo: string | null) {
    return db.organization.update({
      where: { id: organizationId },
      data: { logo },
      select: brandingSelect,
    });
  },

  async updateOrganizationMetadata(organizationId: string, metadata: string) {
    return db.organization.update({
      where: { id: organizationId },
      data: { metadata },
      select: brandingSelect,
    });
  },

  async findMemberInOrg(organizationId: string, memberId: string) {
    return db.member.findFirst({
      where: { id: memberId, organizationId },
      include: { user: { select: { name: true } } },
    });
  },

  async findMemberByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: { organizationId, userId },
      include: { user: { select: { name: true } } },
    });
  },

  async findMembersByIds(organizationId: string, memberIds: string[]) {
    if (memberIds.length === 0) return [];
    return db.member.findMany({
      where: { organizationId, id: { in: memberIds } },
      include: { user: { select: { name: true } } },
    });
  },

  async updateMemberMetadata(
    organizationId: string,
    memberId: string,
    metadata: string,
  ) {
    return this.updateMemberProfessional(organizationId, memberId, {
      metadata,
    });
  },

  async updateMemberProfessional(
    organizationId: string,
    memberId: string,
    data: { metadata?: string; registro?: string; profession?: string },
  ) {
    const existing = await db.member.findFirst({
      where: { id: memberId, organizationId },
      select: { id: true },
    });
    if (!existing) return null;
    return db.member.update({
      where: { id: memberId },
      data: {
        ...(data.metadata !== undefined ? { metadata: data.metadata } : {}),
        ...(data.registro !== undefined ? { registro: data.registro } : {}),
        ...(data.profession !== undefined
          ? { profession: data.profession }
          : {}),
      },
      include: { user: { select: { name: true } } },
    });
  },
};
