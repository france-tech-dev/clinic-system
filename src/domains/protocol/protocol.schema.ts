import { z } from "zod";
import { SPM_SCALE_VALUES } from "./instruments/_shared/item-scale";
import { GMFM88_ITEM_IDS } from "./instruments/fisioterapia/gmfm-88/template";
import { getProtocolInstrument } from "./instruments/instruments";

const gmfmScoreSchema = z.number().int().min(0).max(3).nullable().optional();

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

/** PEDI (0–1) e Perfil Sensorial (0–5); SPM usa letras N/O/F/S. */
const itemProtocolScoreSchema = z.union([
  z.number().int().min(0).max(5),
  z.enum(SPM_SCALE_VALUES),
  z.null(),
]);

const itemProtocolScoresSchema = z.record(
  z.string(),
  itemProtocolScoreSchema.optional(),
);

const protocolEvaluationFieldsSchema = z.object({
  patientId: z.string().min(1),
  protocolId: z.string().min(1),
  label: z.string().min(1).max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scores: z.record(z.string(), z.unknown()),
  notes: z.string().max(2000).optional().default(""),
});

function refineProtocolScores(
  data: z.infer<typeof protocolEvaluationFieldsSchema>,
  ctx: z.RefinementCtx,
) {
  const instrument = getProtocolInstrument(data.protocolId);
  if (!instrument) {
    ctx.addIssue({
      code: "custom",
      message: "Instrumento inválido",
      path: ["protocolId"],
    });
    return;
  }

  if (instrument.family === "gmfm") {
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
}

export const protocolEvaluationFormSchema =
  protocolEvaluationFieldsSchema.superRefine(refineProtocolScores);

export const updateProtocolEvaluationSchema = protocolEvaluationFieldsSchema
  .extend({
    id: z.string().min(1),
  })
  .superRefine(refineProtocolScores);

export const protocolEvaluationIdSchema = z.object({
  id: z.string().min(1),
});

export const saveProtocolInterpretationAISchema = z.object({
  id: z.string().min(1),
  interpretationAI: z
    .string()
    .max(50_000)
    .nullable()
    .transform((value) => {
      if (value == null) return null;
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }),
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
export type SaveProtocolInterpretationAIInput = z.infer<
  typeof saveProtocolInterpretationAISchema
>;
