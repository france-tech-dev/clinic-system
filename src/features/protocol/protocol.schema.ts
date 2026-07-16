import { z } from "zod";
import { GMFM88_ITEM_IDS, GMFM88_PROTOCOL_ID } from "./assessments/fisioterapia/gmfm-88/template";

const gmfmScoreSchema = z
  .number()
  .int()
  .min(0)
  .max(3)
  .nullable()
  .optional();

const gmfmScoresSchema = z
  .record(z.string(), gmfmScoreSchema)
  .superRefine((scores, ctx) => {
    for (const id of GMFM88_ITEM_IDS) {
      const value = scores[id];
      if (value === undefined || value === null) continue;
      if (value < 0 || value > 3) {
        ctx.addIssue({
          code: "custom",
          message: `Pontuação inválida para ${id}`,
        });
      }
    }
  });

export const protocolAssessmentFormSchema = z.object({
  patientId: z.string().min(1),
  protocolId: z.literal(GMFM88_PROTOCOL_ID),
  label: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scores: gmfmScoresSchema,
  notes: z.string().max(2000).optional().default(""),
});

export const updateProtocolAssessmentSchema = protocolAssessmentFormSchema.extend({
  id: z.string().min(1),
});

export const protocolAssessmentIdSchema = z.object({
  id: z.string().min(1),
});

export const listProtocolAssessmentsSchema = z.object({
  patientId: z.string().min(1),
  protocolId: z.literal(GMFM88_PROTOCOL_ID).optional(),
});

export const compareProtocolAssessmentsSchema = z.object({
  baselineId: z.string().min(1),
  followUpId: z.string().min(1),
});

export type ProtocolAssessmentFormInput = z.infer<
  typeof protocolAssessmentFormSchema
>;
export type UpdateProtocolAssessmentInput = z.infer<
  typeof updateProtocolAssessmentSchema
>;
