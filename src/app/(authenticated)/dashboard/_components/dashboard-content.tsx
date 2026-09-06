import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CashflowSummaryCards } from "@/features/finance/components/cashflow-summary-cards";
import type { DashboardPageData } from "@/domains/dashboard/dashboard.types";
import { paths } from "@/shared/constants/paths";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { cn } from "@/shared/lib/utils";
import { ActivityTrendChart } from "./activity-trend-chart";
import { BusiestDaysChart } from "./busiest-days-chart";
import { BusiestHoursHeatmap } from "./busiest-hours-heatmap";
import { CashMonthChart } from "./cash-month-chart";
import { DashboardPeriodNav } from "./dashboard-period-nav";

function alertKindLabel(kind: "sem_avaliacao" | "reavaliacao") {
  return kind === "sem_avaliacao" ? "Sem avaliação" : "Reavaliação";
}

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

  return (
    <div className="flex flex-col gap-8 md:gap-10">
      {/* 1 — Dinheiro (job de liderança) */}
      <DashboardSection
        id="dash-caixa"
        title="Caixa"
        meta={<DashboardPeriodNav period={data.financePeriod} />}
      >
        <CashflowSummaryCards
          summary={data.financeSummary}
          periodLabel={data.financePeriod.label}
          variant="hero"
        />
      </DashboardSection>

      {/* 2 — Pulso clínico */}
      <DashboardSection id="dash-operacao" title="Operação">
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

      {/* 3 — Tendências e padrões */}
      <div className="grid items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <CashMonthChart
          data={data.cashSeries}
          periodLabel={data.financePeriod.label}
        />
        <ActivityTrendChart data={data.activitySeries} />
        <BusiestDaysChart data={data.busiestSlots.weekdays} />
        <BusiestHoursHeatmap data={data.busiestSlots} />
      </div>

      {/* 4 — Atenção */}
      <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-6">
        <DashboardSection id="dash-alertas" title="Alertas clínicos">
          {data.alerts.length === 0 ? (
            <EmptyNote>Nenhum alerta no momento.</EmptyNote>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.alerts.map((a) => (
                <li key={`${a.kind}-${a.patientId}`}>
                  <Link
                    href={paths.paciente(a.patientId)}
                    className="flex flex-col gap-1 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

        <DashboardSection
          id="dash-aniversarios"
          title="Próximos aniversariantes"
        >
          {data.upcomingBirthdays.length === 0 ? (
            <EmptyNote>
              Nenhum aniversário nos próximos 30 dias (ou data de nascimento em
              falta).
            </EmptyNote>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.upcomingBirthdays.map((b) => (
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
          <ul className="flex flex-col gap-2">
            {data.recentActivity.map((a) => (
              <li key={`${a.kind}-${a.id}`}>
                <Link
                  href={paths.paciente(a.patientId)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span>
                    <span className="font-medium">{a.patientName}</span>
                    <span className="text-muted-foreground"> · {a.label}</span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
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
  meta,
  action,
  children,
}: {
  id: string;
  title: string;
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
          hasAside && "sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <h2 id={id} className="font-serif text-lg font-medium tracking-tight">
          {title}
        </h2>
        {hasAside ? (
          <div className="flex flex-wrap items-center gap-3">{meta}{action}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">
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
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}
