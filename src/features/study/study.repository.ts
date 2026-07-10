import { db } from "@/shared/lib/prisma";
import type { StudyFormInput } from "./study.schema";

export const studyRepository = {
  async countByOrg(organizationId: string) {
    return db.studyCard.count({ where: { organizationId } });
  },

  async findMany(
    organizationId: string,
    opts?: { search?: string; categoryId?: string | null },
  ) {
    return db.studyCard.findMany({
      where: {
        organizationId,
        ...(opts?.categoryId ? { categoryId: opts.categoryId } : {}),
        ...(opts?.search
          ? {
              OR: [
                { title: { contains: opts.search } },
                { content: { contains: opts.search } },
              ],
            }
          : {}),
      },
      orderBy: { title: "asc" },
    });
  },

  async findById(organizationId: string, id: string) {
    return db.studyCard.findFirst({
      where: { id, organizationId },
    });
  },

  async findSeedKeys(organizationId: string) {
    const rows = await db.studyCard.findMany({
      where: { organizationId, seedKey: { not: null } },
      select: { seedKey: true },
    });
    return new Set(
      rows.map((r) => r.seedKey).filter((k): k is string => !!k),
    );
  },

  async createMany(
    organizationId: string,
    items: Array<
      StudyFormInput & { isCustom: boolean; seedKey: string | null }
    >,
  ) {
    return db.studyCard.createMany({
      data: items.map((item) => ({
        organizationId,
        title: item.title,
        categoryId: item.categoryId,
        content: item.content,
        isCustom: item.isCustom,
        seedKey: item.seedKey,
      })),
    });
  },

  async create(
    organizationId: string,
    data: StudyFormInput & { isCustom?: boolean; seedKey?: string | null },
  ) {
    return db.studyCard.create({
      data: {
        organizationId,
        title: data.title,
        categoryId: data.categoryId,
        content: data.content,
        isCustom: data.isCustom ?? true,
        seedKey: data.seedKey ?? null,
      },
    });
  },

  async update(
    organizationId: string,
    id: string,
    data: StudyFormInput,
  ) {
    const existing = await db.studyCard.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    return db.studyCard.update({
      where: { id },
      data: {
        title: data.title,
        categoryId: data.categoryId,
        content: data.content,
      },
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.studyCard.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    await db.studyCard.delete({ where: { id } });
    return existing;
  },
};
