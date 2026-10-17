import { Suspense } from "react";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { listGuardians } from "@/domains/guardian/guardian.service";
import type { GuardianDTO } from "@/domains/guardian/guardian.types";
import {
  listPatientsPage,
  PATIENT_PAGE_SIZE,
} from "@/domains/patient/patient.service";
import type { PatientDTO, PatientStatus } from "@/domains/patient/patient.types";
import { listTeamMembers } from "@/domains/team/team.service";
import type { TeamMemberDTO } from "@/domains/team/team.types";
import { findProxyMember } from "@/server/auth/proxy-member";
import { PATIENT_STATUSES } from "@/shared/constants/patient-status";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { PacientesClient } from "./pacientes-client";

function parseStatus(raw: string | undefined): PatientStatus | null {
  if (!raw) return null;
  return (PATIENT_STATUSES as readonly string[]).includes(raw)
    ? (raw as PatientStatus)
    : null;
}

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    member?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const status = parseStatus(params.status);
  const memberId = params.member?.trim() || null;
  const page = Math.max(1, Number(params.page) || 1);

  let patients: PatientDTO[] = [];
  let total = 0;
  let pageCount = 1;
  let guardians: GuardianDTO[] = [];
  let members: TeamMemberDTO[] = [];
  let isLeadership = false;
  let error: string | null = null;

  try {
    const { organizationId, userId } = await requireOrgId();
    const [pageResult, guardianList, memberList, memberGate] =
      await Promise.all([
        listPatientsPage(organizationId, {
          page,
          pageSize: PATIENT_PAGE_SIZE,
          search: search || undefined,
          status,
          memberId,
        }),
        listGuardians(organizationId),
        listTeamMembers(organizationId),
        findProxyMember(userId, organizationId),
      ]);
    patients = pageResult.items;
    total = pageResult.total;
    pageCount = pageResult.pageCount;
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
        key={`${page}-${search}-${status ?? ""}-${memberId ?? ""}`}
        initialPatients={patients}
        total={total}
        page={page}
        pageCount={pageCount}
        pageSize={PATIENT_PAGE_SIZE}
        initialSearch={search}
        initialStatus={status}
        initialMemberId={memberId}
        initialGuardians={guardians}
        initialMembers={members}
        isLeadership={isLeadership}
      />
    </Suspense>
  );
}
