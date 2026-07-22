import { z } from "zod";
import { DEFAULT_MEMBER_PASSWORD } from "@/shared/constants/auth";

const optionalEmail = z
  .string()
  .trim()
  .transform((v) => (v.length > 0 ? v : null))
  .pipe(z.string().email("E-mail inválido").nullable());

const optionalCpf = z
  .string()
  .trim()
  .transform((v) => (v.length > 0 ? v : null));

export const guardianFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do responsável"),
  phone: z.string().trim().default(""),
  email: optionalEmail.optional().default(null),
  cpf: optionalCpf.optional().default(null),
  address: z.string().trim().default(""),
  zipCode: z.string().trim().default(""),
  documentImageUrl: z
    .string()
    .trim()
    .transform((v) => (v.length > 0 ? v : null))
    .optional()
    .default(null),
  insurance: z.string().trim().min(1, "Informe o convênio").default("particular"),
  motherName: z.string().trim().default(""),
  motherCpf: optionalCpf.optional().default(null),
  fatherName: z.string().trim().default(""),
  fatherCpf: optionalCpf.optional().default(null),
});

export const createGuardianSchema = guardianFormSchema
  .extend({
    enablePortalAccess: z.boolean().default(true),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .default(DEFAULT_MEMBER_PASSWORD),
    confirmPassword: z
      .string()
      .min(8, "Confirme a senha")
      .default(DEFAULT_MEMBER_PASSWORD),
  })
  .superRefine((val, ctx) => {
    if (!val.enablePortalAccess) return;

    if (!val.email) {
      ctx.addIssue({
        code: "custom",
        message: "E-mail é obrigatório para acesso ao portal",
        path: ["email"],
      });
    }
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não conferem",
        path: ["confirmPassword"],
      });
    }
  });

export const updateGuardianSchema = guardianFormSchema.extend({
  id: z.string().min(1),
});

export const enableGuardianPortalSchema = z
  .object({
    id: z.string().min(1),
    password: z
      .string()
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .default(DEFAULT_MEMBER_PASSWORD),
    confirmPassword: z
      .string()
      .min(8, "Confirme a senha")
      .default(DEFAULT_MEMBER_PASSWORD),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem",
    path: ["confirmPassword"],
  });

/** Schema do formulário controlado (strings) — usar com `zodResolver` no cliente. */
export const guardianDraftSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome do responsável"),
    phone: z.string(),
    email: z
      .string()
      .trim()
      .refine(
        (v) => v.length === 0 || z.string().email().safeParse(v).success,
        { message: "E-mail inválido" },
      ),
    cpf: z.string(),
    address: z.string(),
    zipCode: z.string(),
    insurance: z.string().trim().min(1, "Informe o convênio"),
    motherName: z.string(),
    motherCpf: z.string(),
    fatherName: z.string(),
    fatherCpf: z.string(),
    enablePortalAccess: z.boolean(),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .superRefine((val, ctx) => {
    if (!val.enablePortalAccess) return;

    if (!val.email.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "E-mail é obrigatório para acesso ao portal",
        path: ["email"],
      });
    }
    if (val.password.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Senha deve ter pelo menos 8 caracteres",
        path: ["password"],
      });
    }
    if (val.confirmPassword.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Confirme a senha",
        path: ["confirmPassword"],
      });
    }
    if (val.password !== val.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "As senhas não conferem",
        path: ["confirmPassword"],
      });
    }
  });

export type GuardianFormInput = z.infer<typeof guardianFormSchema>;
export type CreateGuardianInput = z.infer<typeof createGuardianSchema>;
export type UpdateGuardianInput = z.infer<typeof updateGuardianSchema>;
export type EnableGuardianPortalInput = z.infer<
  typeof enableGuardianPortalSchema
>;
export type GuardianDraftInput = z.infer<typeof guardianDraftSchema>;
