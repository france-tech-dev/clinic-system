import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { getOwnTeamMember } from "@/domains/team/team.service";
import type { TeamMemberDTO } from "@/domains/team/team.types";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { PerfilClient } from "./perfil-client";

export default async function PerfilPage() {
  let error: string | null = null;
  let member: TeamMemberDTO | null = null;

  try {
    const { organizationId, userId } = await requireOrgId();
    member = await getOwnTeamMember(organizationId, userId);
    if (!member) {
      error = "Membro não encontrado nesta clínica.";
    }
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o perfil.";
  }

  return (
    <AppPage title="Perfil">
      {error || !member ? (
        <p className="text-sm text-destructive" role="alert">
          {error ?? "Membro não encontrado nesta clínica."}
        </p>
      ) : (
        <PerfilClient initial={member} />
      )}
    </AppPage>
  );
}
