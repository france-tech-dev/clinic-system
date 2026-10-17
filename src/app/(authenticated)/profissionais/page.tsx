import { Suspense } from "react";
import { headers } from "next/headers";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { listPatients } from "@/domains/patient/patient.service";
import {
  listOrgRoles,
  toAssignableRoleOptions,
} from "@/domains/team/org-role.service";
import { listTeamMembers } from "@/domains/team/team.service";
import type { OrgRoleDTO } from "@/domains/team/org-role.types";
import type {
  AssignablePatientOption,
  TeamMemberDTO,
} from "@/domains/team/team.types";
import { findProxyMember } from "@/server/auth/proxy-member";
import { PATIENT_STATUS_LABEL } from "@/shared/constants/patient-status";
import { auth } from "@/shared/lib/auth";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { ProfissionaisClient } from "./profissionais-client";

async function hasTeamAction(action: "create" | "update" | "delete") {
  try {
    const result = await auth.api.hasPermission({
      headers: await headers(),
      body: { permissions: { team: [action] } },
    });
    return result.success === true;
  } catch {
    return false;
  }
}

export default async function ProfissionaisPage() {
  let members: TeamMemberDTO[] = [];
  let assignablePatients: AssignablePatientOption[] = [];
  let initialRoles: OrgRoleDTO[] = [];
  let roleOptions: { value: string; label: string }[] = [];
  let currentUserId = "";
  let isLeadership = false;
  let canCreateRoles = false;
  let canUpdateRoles = false;
  let canDeleteRoles = false;
  let error: string | null = null;

  try {
    const { organizationId, userId } = await requireOrgId();
    currentUserId = userId;
    const [memberList, patientList, memberGate, roles] = await Promise.all([
      listTeamMembers(organizationId),
      listPatients(organizationId),
      findProxyMember(userId, organizationId),
      listOrgRoles(organizationId),
    ]);
    members = memberList;
    assignablePatients = patientList.map((patient) => ({
      id: patient.id,
      name: patient.name,
      photoUrl: patient.photoUrl,
      statusLabel: PATIENT_STATUS_LABEL[patient.status],
    }));
    isLeadership = isLeadershipRole(memberGate?.role ?? null);
    initialRoles = roles;
    roleOptions = toAssignableRoleOptions(roles);
    if (isLeadership) {
      canCreateRoles = true;
      canUpdateRoles = true;
      canDeleteRoles = true;
    } else {
      const [create, update, del] = await Promise.all([
        hasTeamAction("create"),
        hasTeamAction("update"),
        hasTeamAction("delete"),
      ]);
      canCreateRoles = create;
      canUpdateRoles = update;
      canDeleteRoles = del;
    }
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar os profissionais.";
  }

  if (error) {
    return (
      <AppPage title="Profissionais">
        <p className="text-sm text-destructive">{error}</p>
      </AppPage>
    );
  }

  return (
    <Suspense fallback={<p className="text-sm">A carregar…</p>}>
      <ProfissionaisClient
        initialMembers={members}
        assignablePatients={assignablePatients}
        initialRoles={initialRoles}
        roleOptions={roleOptions}
        currentUserId={currentUserId}
        isLeadership={isLeadership}
        canCreateRoles={canCreateRoles}
        canUpdateRoles={canUpdateRoles}
        canDeleteRoles={canDeleteRoles}
      />
    </Suspense>
  );
}
