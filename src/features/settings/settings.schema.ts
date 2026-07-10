import { z } from "zod";

export const professionalProfileSchema = z.object({
  nome: z.string().trim().default(""),
  registro: z.string().trim().default(""),
  clinica: z.string().trim().default(""),
});

export type ProfessionalProfileInput = z.infer<typeof professionalProfileSchema>;
