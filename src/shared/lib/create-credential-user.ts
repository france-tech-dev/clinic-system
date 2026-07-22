import { hashPassword } from "better-auth/crypto";
import { db } from "@/shared/lib/prisma";

function parseOptionalBirthDate(value: string | null | undefined): Date | null {
  if (!value?.trim()) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])),
  );
}

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
        birthDate: parseOptionalBirthDate(data.birthDate),
        mustChangePassword: true,
      },
    });

    await tx.account.create({
      data: {
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: hashed,
      },
    });

    return user;
  });
}
