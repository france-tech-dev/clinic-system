"use server";

import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";

type PermissionCheck = Record<string, string[]>;

export async function requirePermission(
  permissions: PermissionCheck,
): Promise<void> {
  try {
    const result = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions },
    });
    if (result.success === true) return;
  } catch (error) {
    console.error(error);
  }
  throw new Error("Sem permissão.");
}
