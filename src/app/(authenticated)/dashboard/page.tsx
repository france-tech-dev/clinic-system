import Link from "next/link";
import { AppPage } from "@/app/(authenticated)/_components/app-page";
import { Button } from "@/components/ui/button";
import { buildCashDaySeries } from "@/domains/dashboard/_lib/build-cash-day-series";
import { getDashboardData } from "@/domains/dashboard/dashboard.service";
import type { DashboardPageData } from "@/domains/dashboard/dashboard.types";
import { parseCashPeriodParams } from "@/domains/finance/_lib/period-utils";
import { getCashflowPageData } from "@/domains/finance/finance.service";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { DashboardContent } from "./_components/dashboard-content";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    period?: string;
    from?: string;
    to?: string;
    month?: string;
  }>;
}) {
  const params = await searchParams;
  const period = parseCashPeriodParams(params);

  let data: DashboardPageData | null = null;
  let error: string | null = null;

  try {
    const { organizationId } = await requireOrgId();
    const [dashboard, cashflow] = await Promise.all([
      getDashboardData(organizationId),
      getCashflowPageData(organizationId, period),
    ]);
    data = {
      ...dashboard,
      financeSummary: cashflow.summary,
      financePeriod: cashflow.period,
      cashSeries: buildCashDaySeries(
        cashflow.transactions,
        cashflow.period.start,
        cashflow.period.end,
      ),
    };
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o dashboard.";
  }

  return (
    <AppPage
      title="Dashboard"
      rightContent={
        <Button asChild size="sm">
          <Link href={`${paths.pacientes}?novo=1`}>Novo paciente</Link>
        </Button>
      }
    >
      <DashboardContent data={data} error={error} />
    </AppPage>
  );
}
