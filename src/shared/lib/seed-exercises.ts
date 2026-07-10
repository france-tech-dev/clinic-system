import { DEFAULT_EXERCISES } from "@/shared/constants/default-exercises";
import { db } from "@/shared/lib/prisma";

/** Seed da biblioteca padrão — usado por exercise e dashboard sem acoplar features. */
export async function ensureDefaultExercises(organizationId: string) {
  const count = await db.exercise.count({ where: { organizationId } });
  if (count > 0) return;
  await db.exercise.createMany({
    data: DEFAULT_EXERCISES.map((item) => ({
      organizationId,
      ...item,
    })),
  });
}
