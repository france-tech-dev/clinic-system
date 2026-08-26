import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { getCashflowPageData } from "@/domains/finance/finance.service";
import type {
  CashflowPageData,
  CashMemberOption,
} from "@/domains/finance/finance.types";
import { parseMonthParam } from "@/domains/finance/_lib/month-utils";
import { listPatients } from "@/domains/patient/patient.service";
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
  searchParams: Promise<{ month?: string; member?: string }>;
}) {
  const params = await searchParams;
  const month = parseMonthParam(params.month);

  let error: string | null = null;
  let pageData: CashflowPageData | null = null;
  let patients: Awaited<ReturnType<typeof listPatients>> = [];
  let members: CashMemberOption[] = [];
  let memberFilter = MEMBER_FILTER_ALL;

  try {
    const { organizationId } = await requireOrgId();
    const orgMembers = await listOrganizationMembers(organizationId);
    members = orgMembers.map((m) => ({ id: m.id, name: m.name }));
    const filterId = parseMemberFilter(params.member, members);
    memberFilter = filterId ?? MEMBER_FILTER_ALL;

    [pageData, patients] = await Promise.all([
      getCashflowPageData(organizationId, month, filterId),
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
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : pageData ? (
        <CaixaClient
          key={`${month}-${memberFilter}`}
          initial={pageData}
          patients={patients}
          members={members}
          memberFilter={memberFilter}
        />
      ) : null}
    </AppPage>
  );
}
