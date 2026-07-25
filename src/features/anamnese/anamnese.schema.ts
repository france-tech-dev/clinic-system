import { z } from "zod";

export const anamneseSaveSchema = z.object({
  patientId: z.string().min(1),
  formId: z.string().min(1),
  data: z.record(z.string(), z.unknown()),
});

export const listPatientAnamnesesSchema = z.object({
  patientId: z.string().min(1),
});

export const getAnamneseSchema = z.object({
  patientId: z.string().min(1),
  formId: z.string().min(1),
});

export type AnamneseSaveInput = z.infer<typeof anamneseSaveSchema>;
