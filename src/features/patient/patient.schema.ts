import { z } from "zod";
import { CLINICAL_EVALUATION_DOMAINS } from "@/shared/constants/clinical-evaluation-domains";
import { parseBrl } from "@/shared/lib/money-utils";

export const PATIENT_STATUSES = ["active", "discharged", "paused"] as const;
export const SESSION_STATUSES = ["attended", "absent", "cancelled"] as const;
export const PATIENT_SEXES = [
  "female",
  "male",
  "other",
  "not_informed",
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
  sex: z.enum(PATIENT_SEXES).default("not_informed"),
  photoUrl: emptyToNullUrl.optional().default(null),
  notes: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null ? "" : v.trim()))
    .default(""),
  pricingType: z.enum(["session", "package"]).default("session"),
  price: z.number().positive().nullable().optional(),
  guardianId: z.string().min(1, "Informe o responsável"),
});

export const patientFormSchema = patientFieldsSchema.extend({
  memberIds: z.array(z.string().min(1)).max(50).optional().default([]),
});

export const updatePatientSchema = patientFieldsSchema.extend({
  id: z.string().min(1),
});

/** Schema do diálogo UI: preço em string BRL (sem guardianId). */
export const patientDraftSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do paciente"),
  birthDate: z.string(),
  sex: z.enum(PATIENT_SEXES),
  notes: z.string(),
  pricingType: z.enum(["session", "package"]),
  priceInput: z
    .string()
    .refine(
      (v) => !v.trim() || parseBrl(v) !== null,
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

export const patientMembersSchema = z.object({
  patientId: z.string().min(1),
  memberIds: z.array(z.string().min(1)).max(50),
});

const domainSchema = z.object({
  categoryId: z.string(),
  score: z.number().int().min(0).max(4),
  note: z.string().default(""),
});

export const clinicalEvaluationFormSchema = z.object({
  patientId: z.string().min(1),
  type: z.string().trim().min(1).default("Initial"),
  date: z.string().min(1, "Informe a data"),
  complaint: z.string().trim().default(""),
  history: z.string().trim().default(""),
  domains: z.array(domainSchema).default(
    CLINICAL_EVALUATION_DOMAINS.map((c) => ({
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

export const updateClinicalEvaluationSchema =
  clinicalEvaluationFormSchema.extend({
    id: z.string().min(1),
  });

export const clinicalEvaluationIdSchema = z.object({
  id: z.string().min(1),
});

const sessionFormBaseSchema = z.object({
  patientId: z.string().min(1),
  appointmentId: z.string().min(1, "Selecione o agendamento"),
  status: z.enum(SESSION_STATUSES),
  activities: z.string().trim().default(""),
  observations: z.string().trim().default(""),
});

function refineSessionActivities(
  val: { status: (typeof SESSION_STATUSES)[number]; activities: string },
  ctx: z.RefinementCtx,
) {
  if (val.status === "attended" && !val.activities.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Descreva ao menos as atividades realizadas",
      path: ["activities"],
    });
  }
}

export const sessionFormSchema = sessionFormBaseSchema.superRefine(
  refineSessionActivities,
);

export const updateSessionNoteSchema = sessionFormBaseSchema
  .extend({ id: z.string().min(1) })
  .superRefine(refineSessionActivities);

export const sessionIdSchema = z.object({
  id: z.string().min(1),
});

export type PatientFormInput = z.infer<typeof patientFormSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientDraftInput = z.infer<typeof patientDraftSchema>;
export type ClinicalEvaluationFormInput = z.infer<
  typeof clinicalEvaluationFormSchema
>;
export type SessionFormInput = z.infer<typeof sessionFormSchema>;
