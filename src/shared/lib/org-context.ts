import { getActiveOrganization } from "@/server/organizations/active-organization";
import { AppError } from "@/shared/lib/app-error";
import { auth } from "@/shared/lib/auth";
import { headers } from "next/headers";

export class OrgContextError extends AppError {
  constructor(message: string) {
    super(message);
    this.name = "OrgContextError";
  }
}

export async function requireOrgId(): Promise<{
  userId: string;
  organizationId: string;
}> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new OrgContextError("Sessão inválida. Faça login novamente.");
  }

  let organizationId = session.session.activeOrganizationId ?? null;
  if (!organizationId) {
    const org = await getActiveOrganization(session.user.id);
    organizationId = org?.id ?? null;
  }
  if (!organizationId) {
    throw new OrgContextError(
      "Nenhuma organização ativa. Crie ou selecione uma clínica.",
    );
  }

  return { userId: session.user.id, organizationId };
}
