import { ASSESSMENT_DOMAINS } from "@/shared/constants/assessment-domains";
import { z } from "zod";

const domainSchema = z.object({
  categoryId: z.string(),
  score: z.number().int().min(0).max(4),
  note: z.string().default(""),
});

export const assessmentFormSchema = z.object({
  patientId: z.string().min(1),
  type: z.string().trim().min(1).default("Initial"),
  date: z.string().min(1, "Informe a data"),
  complaint: z.string().trim().default(""),
  history: z.string().trim().default(""),
  domains: z.array(domainSchema).default(
    ASSESSMENT_DOMAINS.map((c) => ({
      categoryId: c.id,
      score: 2,
      note: "",
    })),
  ),
  goals: z.string().trim().default(""),
  interventions: z.string().trim().default(""),
  diagnosis: z.string().trim().default(""),
  referredBy: z.string().trim().default(""),
  familyContext: z.string().trim().default(""),
  previousLevel: z.string().trim().default(""),
  medications: z.string().trim().default(""),
  precautions: z.string().trim().default(""),
  equipment: z.string().trim().default(""),
  frequency: z.string().trim().default(""),
  dischargeCriteria: z.string().trim().default(""),
});

export const updateAssessmentSchema = assessmentFormSchema.extend({
  id: z.string().min(1),
});

export const assessmentIdSchema = z.object({
  id: z.string().min(1),
});

export type AssessmentFormInput = z.infer<typeof assessmentFormSchema>;
