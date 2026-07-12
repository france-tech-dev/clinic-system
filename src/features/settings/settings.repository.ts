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
};
