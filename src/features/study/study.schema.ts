import { z } from "zod";
import { STUDY_CATEGORIES } from "@/shared/constants/study-categories";

const categoryIds = STUDY_CATEGORIES.map((c) => c.id) as [string, ...string[]];

export const studyFormSchema = z.object({
  title: z.string().trim().min(1, "Informe o título"),
  categoryId: z.enum(categoryIds),
  content: z.string().trim().min(1, "Informe o conteúdo"),
});

export const updateStudySchema = studyFormSchema.extend({
  id: z.string().min(1),
});

export const studyIdSchema = z.object({
  id: z.string().min(1),
});

export type StudyFormInput = z.infer<typeof studyFormSchema>;
