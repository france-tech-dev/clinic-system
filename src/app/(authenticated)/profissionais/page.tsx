import { Suspense } from "react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { listTeamMembers } from "@/features/team/team.service";
import type { TeamMemberDTO } from "@/features/team/team.types";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { ProfissionaisClient } from "./profissionais-client";

export default async function ProfissionaisPage() {
  let members: TeamMemberDTO[] = [];
  let error: string | null = null;

  try {
    const { organizationId } = await requireOrgId();
    members = await listTeamMembers(organizationId);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar os profissionais.";
  }

  return (
    <AppPage title="Profissionais">
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <Suspense fallback={<p className="text-sm">A carregar…</p>}>
          <ProfissionaisClient initialMembers={members} />
        </Suspense>
      )}
    </AppPage>
  );
}
