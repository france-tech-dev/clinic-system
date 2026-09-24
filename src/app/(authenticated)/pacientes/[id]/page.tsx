import { notFound } from "next/navigation";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import {
  listPatientAnamneses,
  toAnamneseSummary,
} from "@/domains/anamnese/anamnese.service";
import { buildAnamnesePdfBlocks } from "@/domains/anamnese/_lib/pdf/build-blocks";
import { getCatalogAnamnese } from "@/domains/anamnese/forms";
import { listAssessmentsByPatient } from "@/domains/assessment/assessment.service";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import {
  listEvolutionsByPatient,
  listLinkableAppointments,
} from "@/domains/evolution/evolution.service";
import type {
  EvolutionDTO,
  LinkableAppointmentDTO,
} from "@/domains/evolution/evolution.types";
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
import { DEFAULT_APP_NAME, DEFAULT_PRINT_LOGO } from "@/shared/constants/brand";
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
import { parsePatientDetailTab } from "./_components/patient-detail-types";

export default async function PacienteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string | string[] }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const initialTab = parsePatientDetailTab(query.tab);
  let error: string | null = null;
  let detail: PatientDetailDTO | null = null;
  let assessments: AssessmentDTO[] = [];
  let evolutions: EvolutionDTO[] = [];
  let appointments: LinkableAppointmentDTO[] = [];
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
    clinicName: DEFAULT_APP_NAME,
    logoUrl: DEFAULT_PRINT_LOGO,
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
      a,
      evo,
      appts,
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
      listAssessmentsByPatient(organizationId, id),
      listEvolutionsByPatient(organizationId, id),
      listLinkableAppointments(organizationId, id),
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
    assessments = a ?? [];
    evolutions = evo ?? [];
    appointments = appts ?? [];
    guardians = g;
    professional = prof;
    branding = printBranding;
    orgMembers = members;
    isLeadership = isLeadershipRole(memberGate?.role ?? null);
    protocolInvites = invites;
    canWriteInvites = billing.mode === "full";
    canUseAi = billing.mode === "full";
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
        initialAssessments={assessments}
        initialEvolutions={evolutions}
        initialAppointments={appointments}
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
        initialTab={initialTab}
      />
    </AppPage>
  );
}
