import { DEFAULT_EXERCISES } from "@/shared/constants/default-exercises";
import { ensureDefaultExercises } from "@/shared/lib/seed-exercises";
import { exerciseRepository } from "./exercise.repository";
import type { ExerciseFormInput } from "./exercise.schema";
import type { ExerciseDTO } from "./exercise.types";

function toDTO(row: {
  id: string;
  title: string;
  categoryId: string;
  objective: string;
  materials: string;
  instructions: string;
  duration: string;
  level: string;
  createdAt: Date;
  updatedAt: Date;
}): ExerciseDTO {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.categoryId,
    objective: row.objective,
    materials: row.materials,
    instructions: row.instructions,
    duration: row.duration,
    level: row.level,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listExercises(
  organizationId: string,
  opts?: { search?: string; categoryId?: string | null },
) {
  await ensureDefaultExercises(organizationId);
  const rows = await exerciseRepository.findMany(organizationId, opts);
  return rows.map(toDTO);
}

export async function getExercise(organizationId: string, id: string) {
  const row = await exerciseRepository.findById(organizationId, id);
  return row ? toDTO(row) : null;
}

export async function createExercise(
  organizationId: string,
  data: ExerciseFormInput,
) {
  const row = await exerciseRepository.create(organizationId, data);
  return toDTO(row);
}

export async function updateExercise(
  organizationId: string,
  id: string,
  data: ExerciseFormInput,
) {
  const row = await exerciseRepository.update(organizationId, id, data);
  return row ? toDTO(row) : null;
}

export async function deleteExercise(organizationId: string, id: string) {
  const row = await exerciseRepository.delete(organizationId, id);
  return row ? toDTO(row) : null;
}

export async function restoreDefaultExercises(organizationId: string) {
  await exerciseRepository.createMany(
    organizationId,
    DEFAULT_EXERCISES as ExerciseFormInput[],
  );
  return listExercises(organizationId);
}
