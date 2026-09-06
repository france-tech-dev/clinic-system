import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { parseCashPeriodParams } from "@/domains/finance/_lib/period-utils";
import { getCashflowPageData } from "@/domains/finance/finance.service";
import type {
  CashflowPageData,
  CashMemberOption,
} from "@/domains/finance/finance.types";
import { listPatients } from "@/domains/patient/patient.service";
import type { PatientDTO } from "@/domains/patient/patient.types";
import { listOrganizationMembers } from "@/domains/schedule/schedule.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { CaixaClient } from "./caixa-client";

const MEMBER_FILTER_ALL = "all";

function parseMemberFilter(
  raw: string | undefined,
  members: CashMemberOption[],
): string | null {
  if (!raw || raw === MEMBER_FILTER_ALL) return null;
  return members.some((m) => m.id === raw) ? raw : null;
}

export default async function CaixaPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    from?: string;
    to?: string;
    month?: string;
    member?: string;
  }>;
}) {
  const params = await searchParams;
  const period = parseCashPeriodParams(params);

  let error: string | null = null;
  let pageData: CashflowPageData | null = null;
  let patients: PatientDTO[] = [];
  let members: CashMemberOption[] = [];
  let memberFilter = MEMBER_FILTER_ALL;

  try {
    const { organizationId } = await requireOrgId();
    const orgMembers = await listOrganizationMembers(organizationId);
    members = orgMembers.map((m) => ({ id: m.id, name: m.name }));
    const filterId = parseMemberFilter(params.member, members);
    memberFilter = filterId ?? MEMBER_FILTER_ALL;

    [pageData, patients] = await Promise.all([
      getCashflowPageData(organizationId, period, filterId),
      listPatients(organizationId),
    ]);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o fluxo de caixa.";
  }

  return (
    <AppPage title="Caixa">
      <CaixaClient
        key={`${period.preset}-${period.start}-${period.end}-${memberFilter}`}
        error={error}
        initial={pageData}
        patients={patients}
        members={members}
        memberFilter={memberFilter}
      />
    </AppPage>
  );
}
