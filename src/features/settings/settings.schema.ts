import { z } from "zod";

export const professionalProfileSchema = z.object({
  nome: z.string().trim().default(""),
  registro: z.string().trim().default(""),
  clinica: z.string().trim().default(""),
});

export type ProfessionalProfileInput = z.infer<
  typeof professionalProfileSchema
>;

export const organizationBrandingSchema = z.object({
  clinicName: z
    .string()
    .trim()
    .min(1, "Informe o nome da clínica")
    .max(120, "Nome muito longo"),
});

export type OrganizationBrandingInput = z.infer<
  typeof organizationBrandingSchema
>;
