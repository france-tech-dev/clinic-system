import { notFound } from "next/navigation";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import {
  listPatientAnamneses,
  toAnamneseSummary,
} from "@/domains/anamnese/anamnese.service";
import { buildAnamnesePdfBlocks } from "@/domains/anamnese/_lib/pdf/build-blocks";
import { getCatalogAnamnese } from "@/domains/anamnese/forms";
import { getPatientDetail } from "@/domains/patient/patient.service";
import { listTeamMembers } from "@/domains/team/team.service";
import type { TeamMemberDTO } from "@/domains/team/team.types";
import { listGuardians } from "@/domains/guardian/guardian.service";
import type { GuardianDTO } from "@/domains/guardian/guardian.types";
import type { PatientDetailDTO } from "@/domains/patient/patient.types";
import type { AnamneseSummaryDTO } from "@/domains/anamnese/anamnese.types";
import {
  getPrintBranding,
  getProfessionalProfile,
} from "@/domains/settings/settings.service";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/domains/settings/settings.types";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import { findProxyMember } from "@/server/auth/proxy-member";
import { isLeadershipRole } from "@/shared/lib/member-role";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import {
  listProtocolInvites,
  listPublicInviteProtocols,
} from "@/domains/protocol/invite/protocol-invite.service";
import type { ProtocolInviteDTO } from "@/domains/protocol/invite/protocol-invite.types";
import { getBillingAccess } from "@/server/billing/access";
import type { AiTrialQuotaDTO } from "@/shared/constants/ai-limits";
import { getAiTrialQuota } from "@/shared/lib/ai/generation-limit";
import { headers } from "next/headers";
import { PacienteDetailClient } from "./paciente-detail-client";

export default async function PacienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let error: string | null = null;
  let detail: PatientDetailDTO | null = null;
  let guardians: GuardianDTO[] = [];
  let anamneses: AnamneseSummaryDTO[] = [];
  let anamneseSections: PdfKeyValueSection[] = [];
  let orgMembers: TeamMemberDTO[] = [];
  let isLeadership = false;
  let protocolInvites: ProtocolInviteDTO[] = [];
  let canWriteInvites = false;
  let canUseAi = false;
  let aiTrialQuota: AiTrialQuotaDTO | null = null;
  let professional: ProfessionalProfile = {
    name: "",
    registration: "",
    clinic: "",
  };

  let branding: PrintBranding = {
    clinicName: "Clinic System",
    logoUrl: "/logo_dark.png",
  };

  const inviteProtocols = listPublicInviteProtocols();

  try {
    const { organizationId, userId } = await requireOrgId();
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    const origin = host ? `${proto}://${host}` : undefined;

    const [
      d,
      g,
      prof,
      printBranding,
      anamneseRecords,
      members,
      memberGate,
      invites,
      billing,
    ] = await Promise.all([
      getPatientDetail(organizationId, id),
      listGuardians(organizationId),
      getProfessionalProfile(organizationId),
      getPrintBranding(organizationId),
      listPatientAnamneses(organizationId, id),
      listTeamMembers(organizationId),
      findProxyMember(userId, organizationId),
      listProtocolInvites(organizationId, id, origin),
      getBillingAccess(organizationId),
    ]);
    detail = d;
    guardians = g;
    professional = prof;
    branding = printBranding;
    orgMembers = members;
    isLeadership = isLeadershipRole(memberGate?.role ?? null);
    protocolInvites = invites;
    canWriteInvites =
      billing.mode === "full" && billing.features.includes("avaliacoes");
    canUseAi = billing.mode === "full" && billing.features.includes("ai");
    if (canUseAi) {
      aiTrialQuota = await getAiTrialQuota({
        organizationId,
        userId,
        billing,
      });
    }
    anamneses = anamneseRecords.map((row) =>
      toAnamneseSummary(
        row,
        getCatalogAnamnese(row.formId)?.name ?? row.formId,
      ),
    );
    anamneseSections = anamneseRecords.flatMap((row) => {
      const label = getCatalogAnamnese(row.formId)?.name ?? row.formId;
      return buildAnamnesePdfBlocks(row.formId, row.data).map((section) => ({
        ...section,
        title: `${label} — ${section.title}`,
      }));
    });
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o paciente.";
  }

  if (error) {
    return (
      <AppPage title="Paciente">
        <p className="text-sm text-destructive">{error}</p>
      </AppPage>
    );
  }

  if (!detail) notFound();

  return (
    <AppPage title={detail.patient.name}>
      <PacienteDetailClient
        initial={detail}
        initialGuardians={guardians}
        initialAnamneses={anamneses}
        initialAnamneseSections={anamneseSections}
        professional={professional}
        branding={branding}
        orgMembers={orgMembers}
        isLeadership={isLeadership}
        initialProtocolInvites={protocolInvites}
        inviteProtocols={inviteProtocols}
        canWriteInvites={canWriteInvites}
        canUseAi={canUseAi}
        initialAiTrialQuota={aiTrialQuota}
      />
    </AppPage>
  );
}

