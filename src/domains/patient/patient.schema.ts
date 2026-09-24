import { PATIENT_SEXES } from "@/shared/constants/patient-sex";
import { PATIENT_STATUSES } from "@/shared/constants/patient-status";
import { parseBrl } from "@/shared/lib/money-utils";
import { PatientPricingType, PatientSex } from "@prisma/enums";
import { z } from "zod";

export { PATIENT_SEXES, PATIENT_STATUSES };

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
  sex: z.enum(PATIENT_SEXES).default(PatientSex.NOT_INFORMED),
  photoUrl: emptyToNullUrl.optional().default(null),
  notes: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v == null ? "" : v.trim()))
    .default(""),
  pricingType: z
    .enum([PatientPricingType.SESSION, PatientPricingType.PACKAGE])
    .default(PatientPricingType.SESSION),
  price: z.number().positive().nullable().optional(),
  guardianId: z.string().min(1, "Informe o responsável"),
});

export const patientFormSchema = patientFieldsSchema.extend({
  memberIds: z.array(z.string().min(1)).max(50).optional().default([]),
});

export const updatePatientSchema = patientFieldsSchema
  .omit({ photoUrl: true })
  .extend({
    id: z.string().min(1),
  });

/** Schema do diálogo UI: preço em string BRL (sem guardianId). */
export const patientDraftSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do paciente"),
  birthDate: z.string(),
  sex: z.enum(PATIENT_SEXES),
  notes: z.string(),
  pricingType: z.enum([PatientPricingType.SESSION, PatientPricingType.PACKAGE]),
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

export type PatientFormInput = z.infer<typeof patientFormSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientDraftInput = z.infer<typeof patientDraftSchema>;
