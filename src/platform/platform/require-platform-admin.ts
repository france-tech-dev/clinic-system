import { headers } from "next/headers";
import { auth } from "@/shared/lib/auth";
import { isPlatformAdminUserId } from "@/shared/lib/platform-admin";

export async function requirePlatformAdmin(): Promise<{ userId: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  const userId = session?.user?.id;
  if (!userId || !isPlatformAdminUserId(userId)) {
    throw new Error("Sem permissão.");
  }
  return { userId };
}
