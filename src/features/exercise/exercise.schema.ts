import { z } from "zod";
import { EXERCISE_CATEGORIES, EXERCISE_LEVELS } from "@/shared/constants/exercise-categories";

const categoryIds = EXERCISE_CATEGORIES.map((c) => c.id) as [
  string,
  ...string[],
];

export const exerciseFormSchema = z.object({
  title: z.string().trim().min(1, "Informe o título"),
  categoryId: z.enum(categoryIds),
  objective: z.string().trim().min(1, "Informe o objetivo"),
  materials: z.string().trim().default(""),
  instructions: z.string().trim().min(1, "Informe as instruções"),
  duration: z.string().trim().default(""),
  level: z.enum(EXERCISE_LEVELS),
});

export const updateExerciseSchema = exerciseFormSchema.extend({
  id: z.string().min(1),
});

export const exerciseIdSchema = z.object({
  id: z.string().min(1),
});

export type ExerciseFormInput = z.infer<typeof exerciseFormSchema>;
