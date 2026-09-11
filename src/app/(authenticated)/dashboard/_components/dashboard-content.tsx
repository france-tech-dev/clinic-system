import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CashflowSummaryCards } from "@/features/finance/components/cashflow-summary-cards";
import { cashPeriodToSearchParams } from "@/domains/finance/_lib/period-utils";
import type { CashListView } from "@/domains/finance/_lib/cash-list-view";
import type { DashboardPageData } from "@/domains/dashboard/dashboard.types";
import { paths } from "@/shared/constants/paths";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { cn } from "@/shared/lib/utils";
import { ActivityTrendChart } from "./activity-trend-chart";
import { BusiestDaysChart } from "./busiest-days-chart";
import { BusiestHoursHeatmap } from "./busiest-hours-heatmap";
import { DashboardPeriodNav } from "./dashboard-period-nav";

function alertKindLabel(kind: "sem_avaliacao" | "reavaliacao") {
  return kind === "sem_avaliacao" ? "Sem avaliação" : "Reavaliação";
}

function caixaHref(
  period: DashboardPageData["financePeriod"],
  view?: Exclude<CashListView, "all">,
) {
  return `${paths.caixa}?${cashPeriodToSearchParams(period, {
    view,
  })}`;
}

const listLinkClass =
  "flex flex-col gap-1 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function DashboardContent({
  data,
  error,
}: {
  data: DashboardPageData | null;
  error: string | null;
}) {
  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm"
      >
        <p className="text-destructive">{error}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={paths.dashboard}>Tentar de novo</Link>
          </Button>
          {error.includes("organização") ? (
            <Button asChild size="sm">
              <Link href={paths.organizacao}>Criar clínica</Link>
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const openCaixa = (
    <Button asChild size="sm" variant="outline">
      <Link href={caixaHref(data.financePeriod)}>Abrir caixa</Link>
    </Button>
  );

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {/* 1 — Caixa: KPIs */}
      <DashboardSection
        id="dash-caixa"
        title="Caixa"
        description={data.financePeriod.label}
        meta={<DashboardPeriodNav period={data.financePeriod} />}
        action={openCaixa}
      >
        <CashflowSummaryCards
          summary={data.financeSummary}
          periodLabel={data.financePeriod.label}
          variant="overview"
          viewHref={(view) => caixaHref(data.financePeriod, view)}
        />
      </DashboardSection>

      {/* 2 — Operação */}
      <DashboardSection
        id="dash-operacao"
        title="Operação"
        description="Pulso clínico"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <KpiCard
            href={paths.pacientes}
            label="Pacientes ativos"
            value={String(data.stats.activePatients)}
            hint={`de ${data.stats.totalPatients} no total`}
          />
          <KpiCard
            href={paths.avaliacoes.root}
            label="Avaliações"
            value={String(data.stats.totalClinicalEvaluations)}
            hint="registradas"
          />
          <KpiCard
            href={paths.agenda}
            label="Evoluções"
            value={String(data.stats.sessionsThisWeek)}
            hint="nesta semana"
          />
        </div>
      </DashboardSection>

      {/* 3 — Gráficos */}
      <DashboardSection
        id="dash-padroes"
        title="Padrões"
        description="Atividade e horários mais ocupados"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
          <div className="min-w-0 flex-1">
            <ActivityTrendChart data={data.activitySeries} />
          </div>
          <div className="min-w-0 flex-1">
            <BusiestDaysChart data={data.busiestSlots.weekdays} />
          </div>
          <BusiestHoursHeatmap data={data.busiestSlots} />
        </div>
      </DashboardSection>

      {/* 4 — Atenção */}
      <div className="grid items-start gap-8 sm:grid-cols-2 md:gap-6">
        <DashboardSection id="dash-alertas" title="Alertas">
          {data.alerts.length === 0 ? (
            <EmptyNote>Nenhum alerta no momento.</EmptyNote>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.alerts.slice(0, 5).map((a) => (
                <li key={`${a.kind}-${a.patientId}`}>
                  <Link
                    href={paths.paciente(a.patientId)}
                    className={listLinkClass}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{a.patientName}</span>
                      <Badge
                        variant={
                          a.kind === "reavaliacao" ? "destructive" : "outline"
                        }
                      >
                        {alertKindLabel(a.kind)}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">{a.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>

        <DashboardSection id="dash-aniversarios" title="Aniversários">
          {data.upcomingBirthdays.length === 0 ? (
            <EmptyNote>
              Nenhum nos próximos 30 dias (ou data em falta).
            </EmptyNote>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.upcomingBirthdays.slice(0, 5).map((b) => (
                <li key={b.patientId}>
                  <Link
                    href={paths.paciente(b.patientId)}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="min-w-0 truncate font-medium">
                      {b.patientName}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {b.dayMonthLabel}
                      <span className="text-muted-foreground/80">
                        {" "}
                        · {b.turningAge} anos
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DashboardSection>
      </div>

      {/* 5 — Feed */}
      <DashboardSection id="dash-atividade" title="Atividade recente">
        {data.recentActivity.length === 0 ? (
          <EmptyNote>Ainda sem registros.</EmptyNote>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {data.recentActivity.map((a) => (
              <li key={`${a.kind}-${a.id}`}>
                <Link
                  href={paths.paciente(a.patientId)}
                  className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{a.patientName}</span>
                    <span className="text-muted-foreground"> · {a.label}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {formatDateBR(a.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>
    </div>
  );
}

function DashboardSection({
  id,
  title,
  description,
  meta,
  action,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  const hasAside = meta != null || action != null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby={id}>
      <div
        className={cn(
          "flex flex-col gap-2",
          hasAside && "sm:flex-row sm:items-start sm:justify-between",
        )}
      >
        <div className="min-w-0">
          <h2
            id={id}
            className="font-serif text-xl font-semibold tracking-tight"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {hasAside ? (
          <div className="flex flex-wrap items-center gap-3 sm:pt-0.5">
            {meta}
            {action}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-3 py-5 text-sm text-muted-foreground">
      {children}
    </p>
  );
}

function KpiCard({
  href,
  label,
  value,
  hint,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}
