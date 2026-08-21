import { z } from "zod";
import {
  GMFM88_ITEM_IDS,
  GMFM88_PROTOCOL_ID,
} from "./evaluation-modules/fisioterapia/gmfm-88/template";
import { SPM_SCALE_VALUES } from "./evaluation-modules/_shared/item-scale";

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

const itemProtocolScoreSchema = z.union([
  z.number().int().min(0).max(1),
  z.enum(SPM_SCALE_VALUES),
  z.null(),
]);

const itemProtocolScoresSchema = z.record(
  z.string(),
  itemProtocolScoreSchema.optional(),
);

export const protocolEvaluationFormSchema = z
  .object({
    patientId: z.string().min(1),
    protocolId: z.string().min(1),
    label: z.string().min(1).max(80),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    scores: z.record(z.string(), z.unknown()),
    notes: z.string().max(2000).optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.protocolId === GMFM88_PROTOCOL_ID) {
      const parsed = gmfmScoresSchema.safeParse(data.scores);
      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: "Pontuações GMFM inválidas",
          path: ["scores"],
        });
      }
      return;
    }
    const parsed = itemProtocolScoresSchema.safeParse(data.scores);
    if (!parsed.success) {
      ctx.addIssue({
        code: "custom",
        message: "Pontuações inválidas",
        path: ["scores"],
      });
    }
  });

export const updateProtocolEvaluationSchema = z.object({
  id: z.string().min(1),
  patientId: z.string().min(1),
  protocolId: z.string().min(1),
  label: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scores: z.record(z.string(), z.unknown()),
  notes: z.string().max(2000).optional().default(""),
});

export const protocolEvaluationIdSchema = z.object({
  id: z.string().min(1),
});

export const listProtocolEvaluationsSchema = z.object({
  patientId: z.string().min(1),
  protocolId: z.string().min(1).optional(),
});

export const compareProtocolEvaluationsSchema = z.object({
  baselineId: z.string().min(1),
  followUpId: z.string().min(1),
});

export type ProtocolEvaluationFormInput = z.infer<
  typeof protocolEvaluationFormSchema
>;
export type UpdateProtocolEvaluationInput = z.infer<
  typeof updateProtocolEvaluationSchema
>;
