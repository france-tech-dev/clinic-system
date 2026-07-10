import { DEFAULT_STUDY } from "@/shared/constants/default-study";
import { db } from "@/shared/lib/prisma";

/** Seed das notas de estudo padrão — usado por study e dashboard sem acoplar features. */
export async function ensureDefaultStudy(organizationId: string) {
  const count = await db.studyCard.count({ where: { organizationId } });
  if (count > 0) return;
  await db.studyCard.createMany({
    data: DEFAULT_STUDY.map((item) => ({
      organizationId,
      title: item.title,
      categoryId: item.categoryId,
      content: item.content,
      isCustom: false,
      seedKey: item.seedKey,
    })),
  });
}
