import { z } from "zod";
import { EVALUATION_DOMAINS } from "@/shared/constants/evaluation-domains";
import { parseBrlToCents } from "@/shared/lib/money-utils";

export const PATIENT_STATUSES = ["ativo", "alta", "pausado"] as const;
export const SESSION_STATUSES = ["compareceu", "faltou", "cancelado"] as const;
export const PATIENT_SEXES = [
  "feminino",
  "masculino",
  "outro",
  "nao_informado",
] as const;

const optionalDateParam = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  })
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
      .nullable(),
  );

const emptyToNullUrl = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  });

const patientFieldsSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do paciente"),
  birthDate: optionalDateParam.optional().default(null),
  sex: z.enum(PATIENT_SEXES).default("nao_informado"),
  photoUrl: emptyToNullUrl.optional().default(null),
  notes: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null ? "" : v.trim()))
    .default(""),
  pricingType: z.enum(["sessao", "pacote"]).default("sessao"),
  priceCents: z.number().int().positive().nullable().optional(),
  guardianId: z.string().min(1, "Informe o responsável"),
});

export const patientFormSchema = patientFieldsSchema;

export const updatePatientSchema = patientFieldsSchema.extend({
  id: z.string().min(1),
});

/** Schema do diálogo UI: preço em string BRL (sem guardianId). */
export const patientDraftSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do paciente"),
  birthDate: z.string(),
  sex: z.enum(PATIENT_SEXES),
  notes: z.string(),
  pricingType: z.enum(["sessao", "pacote"]),
  priceInput: z
    .string()
    .refine(
      (v) => !v.trim() || parseBrlToCents(v) !== null,
      "Informe um valor válido",
    ),
});

export const patientIdSchema = z.object({
  id: z.string().min(1),
});

export const patientStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(PATIENT_STATUSES),
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
    EVALUATION_DOMAINS.map((c) => ({
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

const sessionFormBaseSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().min(1, "Selecione o agendamento"),
  status: z.enum(SESSION_STATUSES),
  atividades: z.string().trim().default(""),
  observacoes: z.string().trim().default(""),
});

function refineSessionAtividades(
  val: { status: (typeof SESSION_STATUSES)[number]; atividades: string },
  ctx: z.RefinementCtx,
) {
  if (val.status === "compareceu" && !val.atividades.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Descreva ao menos as atividades realizadas",
      path: ["atividades"],
    });
  }
}

export const sessionFormSchema =
  sessionFormBaseSchema.superRefine(refineSessionAtividades);

export const updateSessionNoteSchema = sessionFormBaseSchema
  .extend({ id: z.string().min(1) })
  .superRefine(refineSessionAtividades);

export const sessionIdSchema = z.object({
  id: z.string().min(1),
});

export const roteiroNoteSaveSchema = z.object({
  patientId: z.string().min(1),
  roteiroId: z.enum(["integracao-sensorial", "grafomotor", "alimentacao"]),
  categoryTick: z.string().min(1),
  notes: z.string().default(""),
});

export type PatientFormInput = z.infer<typeof patientFormSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientDraftInput = z.infer<typeof patientDraftSchema>;
export type EvaluationFormInput = z.infer<typeof evaluationFormSchema>;
export type SessionFormInput = z.infer<typeof sessionFormSchema>;
export type RoteiroNoteSaveInput = z.infer<typeof roteiroNoteSaveSchema>;
