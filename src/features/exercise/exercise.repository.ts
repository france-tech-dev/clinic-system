import { db } from "@/shared/lib/prisma";
import type { ExerciseFormInput } from "./exercise.schema";

export const exerciseRepository = {
  async countByOrg(organizationId: string) {
    return db.exercise.count({ where: { organizationId } });
  },

  async createMany(
    organizationId: string,
    items: ExerciseFormInput[],
  ) {
    return db.exercise.createMany({
      data: items.map((item) => ({
        organizationId,
        ...item,
      })),
    });
  },

  async findMany(
    organizationId: string,
    opts?: { search?: string; categoryId?: string | null },
  ) {
    return db.exercise.findMany({
      where: {
        organizationId,
        ...(opts?.categoryId ? { categoryId: opts.categoryId } : {}),
        ...(opts?.search
          ? {
              OR: [
                { title: { contains: opts.search } },
                { objective: { contains: opts.search } },
              ],
            }
          : {}),
      },
      orderBy: { title: "asc" },
    });
  },

  async findById(organizationId: string, id: string) {
    return db.exercise.findFirst({
      where: { id, organizationId },
    });
  },

  async create(organizationId: string, data: ExerciseFormInput) {
    return db.exercise.create({
      data: { organizationId, ...data },
    });
  },

  async update(
    organizationId: string,
    id: string,
    data: ExerciseFormInput,
  ) {
    const existing = await db.exercise.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    return db.exercise.update({
      where: { id },
      data,
    });
  },

  async delete(organizationId: string, id: string) {
    const existing = await db.exercise.findFirst({
      where: { id, organizationId },
    });
    if (!existing) return null;
    await db.exercise.delete({ where: { id } });
    return existing;
  },
};
