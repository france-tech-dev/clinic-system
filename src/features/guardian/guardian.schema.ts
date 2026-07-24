import { z } from "zod";
import { DEFAULT_MEMBER_PASSWORD } from "@/shared/constants/auth";

/** Aceita string | null | undefined → trim; vazio → null. */
const emptyToNull = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => {
    if (v == null) return null;
    const t = v.trim();
    return t.length > 0 ? t : null;
  });

const optionalEmail = emptyToNull.pipe(z.email("E-mail inválido").nullable());

const optionalCpf = emptyToNull;

const optionalText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (v == null ? "" : v.trim()));

export const guardianFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do responsável"),
  phone: optionalText.default(""),
  email: optionalEmail.optional().default(null),
  cpf: optionalCpf.optional().default(null),
  address: optionalText.default(""),
  zipCode: optionalText.default(""),
  documentImageUrl: emptyToNull.optional().default(null),
  insurance: optionalText
    .transform((v) => (v.length > 0 ? v : "particular"))
    .pipe(z.string().min(1, "Informe o convênio"))
    .default("particular"),
  motherName: optionalText.default(""),
  motherCpf: optionalCpf.optional().default(null),
  fatherName: optionalText.default(""),
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
      .refine((v) => v.length === 0 || z.email().safeParse(v).success, {
        message: "E-mail inválido",
      }),
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
