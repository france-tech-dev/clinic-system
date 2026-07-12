import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { getCashflowPageData } from "@/features/finance/finance.service";
import type { CashflowPageData } from "@/features/finance/finance.types";
import { parseMonthParam } from "@/features/finance/_lib/month-utils";
import { listPatients } from "@/features/patient/patient.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { CaixaClient } from "./caixa-client";

export default async function CaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const month = parseMonthParam(params.month);

  let error: string | null = null;
  let pageData: CashflowPageData | null = null;
  let patients: Awaited<ReturnType<typeof listPatients>> = [];

  try {
    const { organizationId } = await requireOrgId();
    [pageData, patients] = await Promise.all([
      getCashflowPageData(organizationId, month),
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
        <CaixaClient key={month} initial={pageData} patients={patients} />
      ) : null}
    </AppPage>
  );
}
