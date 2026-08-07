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

  async findMemberByUserId(organizationId: string, userId: string) {
    return db.member.findFirst({
      where: { organizationId, userId },
      include: { user: { select: { name: true } } },
    });
  },

  async updateMemberProfessional(
    organizationId: string,
    memberId: string,
    data: { metadata?: string; registration?: string; profession?: string },
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
        ...(data.registration !== undefined ? { registration: data.registration } : {}),
        ...(data.profession !== undefined
          ? { profession: data.profession }
          : {}),
      },
      include: { user: { select: { name: true } } },
    });
  },
};
