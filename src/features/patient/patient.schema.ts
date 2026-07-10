import { z } from "zod";
import { EXERCISE_CATEGORIES } from "@/shared/constants/exercise-categories";

export const PATIENT_STATUSES = ["ativo", "alta", "pausado"] as const;
export const SESSION_STATUSES = ["compareceu", "faltou", "cancelado"] as const;

export const patientFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do paciente"),
  notes: z.string().trim().default(""),
});

export const updatePatientSchema = patientFormSchema.extend({
  id: z.string().min(1),
});

export const patientIdSchema = z.object({
  id: z.string().min(1),
});

export const patientStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(PATIENT_STATUSES),
});

export const assignExerciseSchema = z.object({
  patientId: z.string().min(1),
  exerciseId: z.string().min(1),
});

export const planItemIdSchema = z.object({
  id: z.string().min(1),
});

const domainSchema = z.object({
  categoryId: z.string(),
  score: z.number().int().min(0).max(4),
  note: z.string().default(""),
});

export const evaluationFormSchema = z.object({
  patientId: z.string().min(1),
  tipo: z.string().trim().min(1).default("Inicial"),
  date: z.string().min(1, "Informe a data"),
  queixa: z.string().trim().default(""),
  historia: z.string().trim().default(""),
  domains: z.array(domainSchema).default(
    EXERCISE_CATEGORIES.map((c) => ({
      categoryId: c.id,
      score: 2,
      note: "",
    })),
  ),
  objetivos: z.string().trim().default(""),
  condutas: z.string().trim().default(""),
  diagnostico: z.string().trim().default(""),
  encaminhadoPor: z.string().trim().default(""),
  contextoFamiliar: z.string().trim().default(""),
  nivelPrevio: z.string().trim().default(""),
  medicacoes: z.string().trim().default(""),
  precaucoes: z.string().trim().default(""),
  equipamentos: z.string().trim().default(""),
  frequencia: z.string().trim().default(""),
  criteriosAlta: z.string().trim().default(""),
});

export const updateEvaluationSchema = evaluationFormSchema.extend({
  id: z.string().min(1),
});

export const evaluationIdSchema = z.object({
  id: z.string().min(1),
});

export const anamneseSaveSchema = z.object({
  patientId: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export const sessionFormSchema = z
  .object({
    patientId: z.string().min(1),
    date: z.string().min(1, "Informe a data da sessão"),
    status: z.enum(SESSION_STATUSES),
    atividades: z.string().trim().default(""),
    observacoes: z.string().trim().default(""),
  })
  .superRefine((val, ctx) => {
    if (val.status === "compareceu" && !val.atividades.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Descreva ao menos as atividades realizadas",
        path: ["atividades"],
      });
    }
  });

export const updateSessionNoteSchema = z
  .object({
    id: z.string().min(1),
    patientId: z.string().min(1),
    date: z.string().min(1, "Informe a data da sessão"),
    status: z.enum(SESSION_STATUSES),
    atividades: z.string().trim().default(""),
    observacoes: z.string().trim().default(""),
  })
  .superRefine((val, ctx) => {
    if (val.status === "compareceu" && !val.atividades.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Descreva ao menos as atividades realizadas",
        path: ["atividades"],
      });
    }
  });

export const sessionIdSchema = z.object({
  id: z.string().min(1),
});

export const roteiroNoteSaveSchema = z.object({
  patientId: z.string().min(1),
  roteiroId: z.enum(["si", "grafomotor", "alimentacao"]),
  categoryTick: z.string().min(1),
  notes: z.string().default(""),
});

export type PatientFormInput = z.infer<typeof patientFormSchema>;
export type EvaluationFormInput = z.infer<typeof evaluationFormSchema>;
export type SessionFormInput = z.infer<typeof sessionFormSchema>;
export type RoteiroNoteSaveInput = z.infer<typeof roteiroNoteSaveSchema>;
