import { parseCivilDateParam } from "@/shared/lib/civil-date-param";
import { db } from "@/shared/lib/prisma";
import { hashPassword } from "better-auth/crypto";

/** Cria User + Account credential com `mustChangePassword` (padrão profissionais/responsáveis). */
export async function createCredentialUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  birthDate?: string | null;
}) {
  const hashed = await hashPassword(data.password);
  return db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        emailVerified: true,
        phone: data.phone?.trim() || null,
        birthDate: parseCivilDateParam(data.birthDate),
        mustChangePassword: true,
      },
    });

    await tx.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        issuer: "local:credential",
        password: hashed,
      },
    });

    return user;
  });
}
