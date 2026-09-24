import { EVOLUTION_STATUSES } from "@/shared/constants/evolution-status";
import { EvolutionStatus } from "@prisma/enums";
import { z } from "zod";

const evolutionFormBaseSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().min(1, "Selecione o agendamento"),
  status: z.enum(EVOLUTION_STATUSES),
  activities: z.string().trim().default(""),
  observations: z.string().trim().default(""),
});

function refineEvolutionActivities(
  val: { status: (typeof EVOLUTION_STATUSES)[number]; activities: string },
  ctx: z.RefinementCtx,
) {
  if (val.status === EvolutionStatus.ATTENDED && !val.activities.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Descreva ao menos as atividades realizadas",
      path: ["activities"],
    });
  }
}

export const evolutionFormSchema = evolutionFormBaseSchema.superRefine(
  refineEvolutionActivities,
);

export const updateEvolutionSchema = evolutionFormBaseSchema
  .extend({ id: z.string().min(1) })
  .superRefine(refineEvolutionActivities);

export const evolutionIdSchema = z.object({
  id: z.string().min(1),
});

export type EvolutionFormInput = z.infer<typeof evolutionFormSchema>;
