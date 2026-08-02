"use server";

import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";

type PermissionCheck = Record<string, string[]>;

/** Verifica permissões do membro na organização activa (Better Auth AC). */
export async function hasOrgPermission(
  permissions: PermissionCheck,
): Promise<boolean> {
  try {
    const result = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions },
    });
    return result.success === true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
