import { z } from "zod";
import { HEALTH_PROFESSION_IDS } from "@/shared/constants/professions";

export const TEAM_MEMBER_ROLES = ["MEMBER", "MANAGER", "ADMIN"] as const;
export const TEAM_MEMBER_STATUSES = ["ativo", "inativo"] as const;

const professionalBaseSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome"),
  email: z.string().trim().email("E-mail inválido"),
  profession: z.enum(HEALTH_PROFESSION_IDS, {
    message: "Selecione a profissão",
  }),
  registro: z.string().trim().min(1, "Informe o número de registro"),
  phone: z.string().trim().min(8, "Informe o contato"),
  birthDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data de aniversário inválida"),
  role: z.enum(TEAM_MEMBER_ROLES),
});

export const createProfessionalSchema = professionalBaseSchema
  .extend({
    password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(8, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export type CreateProfessionalInput = z.infer<typeof createProfessionalSchema>;

export const updateProfessionalSchema = professionalBaseSchema
  .omit({ role: true })
  .extend({
    memberId: z.string().trim().min(1, "Profissional inválido"),
    role: z.enum(["MEMBER", "MANAGER", "ADMIN", "OWNER"]),
    status: z.enum(TEAM_MEMBER_STATUSES, {
      message: "Selecione o status",
    }),
  });

export type UpdateProfessionalInput = z.infer<typeof updateProfessionalSchema>;

export const changeForcedPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .trim(),
    confirmPassword: z.string().min(8).trim(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

export type ChangeForcedPasswordInput = z.infer<
  typeof changeForcedPasswordSchema
>;
