import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { getDashboardData } from "@/features/dashboard/dashboard.service";
import type { DashboardPageData } from "@/features/dashboard/dashboard.types";
import { getCashflowPageData } from "@/features/finance/finance.service";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { PainelContent } from "./_components/painel-content";

export default async function PainelPage() {
  let data: DashboardPageData | null = null;
  let error: string | null = null;

  try {
    const { organizationId } = await requireOrgId();
    const [dashboard, cashflow] = await Promise.all([
      getDashboardData(organizationId),
      getCashflowPageData(organizationId),
    ]);
    data = {
      ...dashboard,
      financeSummary: cashflow.summary,
      financeMonthLabel: cashflow.monthLabel,
    };
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o painel.";
  }

  return (
    <AppPage title="Painel">
      <PainelContent data={data} error={error} />
    </AppPage>
  );
}
