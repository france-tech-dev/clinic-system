import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    DATABASE_URL: z.string().min(1),
    DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),

    BETTER_AUTH_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),

    BREVO_SMTP_USER: z.string().optional(),
    BREVO_SMTP_KEY: z.string().optional(),
    BREVO_SMTP_HOST: z.string().min(1).default("smtp-relay.brevo.com"),
    BREVO_SMTP_PORT: z.coerce.number().int().positive().default(587),
    EMAIL_NO_REPLY: z.string().optional(),

    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRICE_STARTER: z.string().optional(),
    STRIPE_PRICE_PRO: z.string().optional(),
    STRIPE_PRICE_ENTERPRISE: z.string().optional(),

    PLATFORM_ADMIN_USER_IDS: z.string().optional().default(""),

    OBJECT_STORAGE_DRIVER: z.enum(["local", "r2"]).default("local"),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_ACCESS_KEY_ID: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().optional(),
    R2_BUCKET: z.string().optional(),
    R2_PUBLIC_BASE_URL: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.OBJECT_STORAGE_DRIVER !== "r2") return;

    const required = [
      ["R2_ACCOUNT_ID", data.R2_ACCOUNT_ID],
      ["R2_ACCESS_KEY_ID", data.R2_ACCESS_KEY_ID],
      ["R2_SECRET_ACCESS_KEY", data.R2_SECRET_ACCESS_KEY],
      ["R2_BUCKET", data.R2_BUCKET],
      ["R2_PUBLIC_BASE_URL", data.R2_PUBLIC_BASE_URL],
    ] as const;

    for (const [name, value] of required) {
      if (!value) {
        ctx.addIssue({
          code: "custom",
          message: `${name} é obrigatória quando OBJECT_STORAGE_DRIVER=r2`,
          path: [name],
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

const skipValidation = process.env.SKIP_ENV_VALIDATION === "true";

const parsed = envSchema.safeParse(process.env);

if (!parsed.success && !skipValidation) {
  const lines = parsed.error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `  - ${path}: ${issue.message}`;
  });
  throw new Error(`Variáveis de ambiente inválidas:\n${lines.join("\n")}`);
}

export const env = (parsed.success ? parsed.data : process.env) as Env;
