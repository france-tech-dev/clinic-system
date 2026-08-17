import { Suspense } from "react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { listGuardians } from "@/features/guardian/guardian.service";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import { listPatients } from "@/features/patient/patient.service";
import type { PatientDTO } from "@/features/patient/patient.types";
import { listTeamMembers } from "@/features/team/team.service";
import type { TeamMemberDTO } from "@/features/team/team.types";
import { findProxyMember } from "@/server/auth/proxy-member";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { PacientesClient } from "./pacientes-client";

export default async function PacientesPage() {
  let patients: PatientDTO[] = [];
  let guardians: GuardianDTO[] = [];
  let members: TeamMemberDTO[] = [];
  let isLeadership = false;
  let error: string | null = null;

  try {
    const { organizationId, userId } = await requireOrgId();
    const [patientList, guardianList, memberList, memberGate] =
      await Promise.all([
        listPatients(organizationId),
        listGuardians(organizationId),
        listTeamMembers(organizationId),
        findProxyMember(userId, organizationId),
      ]);
    patients = patientList;
    guardians = guardianList;
    members = memberList;
    isLeadership = isLeadershipRole(memberGate?.role ?? null);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar os pacientes.";
  }

  if (error) {
    return (
      <AppPage title="Pacientes">
        <p className="text-sm text-destructive">{error}</p>
      </AppPage>
    );
  }

  return (
    <Suspense fallback={<p className="text-sm">A carregar…</p>}>
      <PacientesClient
        initialPatients={patients}
        initialGuardians={guardians}
        initialMembers={members}
        isLeadership={isLeadership}
      />
    </Suspense>
  );
}
