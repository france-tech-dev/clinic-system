import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CashflowSummaryCards } from "@/features/finance/components/cashflow-summary-cards";
import type { DashboardPageData } from "@/features/dashboard/dashboard.types";
import { paths } from "@/shared/constants/paths";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { formatBrl } from "@/shared/lib/money-utils";
import { cn } from "@/shared/lib/utils";
import { ActivityTrendChart } from "./activity-trend-chart";
import { CashMonthChart } from "./cash-month-chart";

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
  return (
    <div className="flex flex-col gap-8">
      {error ? (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm"
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
      ) : null}

      {data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
            <KpiCard
              href={paths.caixa}
              label="Saldo do mês"
              value={formatBrl(data.financeSummary.balance)}
              hint={data.financeMonthLabel}
              valueClassName={
                data.financeSummary.balance < 0
                  ? "text-red-600 dark:text-red-400"
                  : undefined
              }
            />
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-2">
            <CashMonthChart
              data={data.cashSeries}
              monthLabel={data.financeMonthLabel}
            />
            <ActivityTrendChart data={data.activitySeries} />
          </div>

          <section className="flex flex-col gap-3" aria-labelledby="dash-caixa">
            <div className="flex items-center justify-between gap-2">
              <h2 id="dash-caixa" className="font-serif text-lg font-medium">
                Resumo do caixa
              </h2>
              <Link
                href={paths.caixa}
                className="text-sm font-medium text-primary hover:underline"
              >
                Abrir caixa
              </Link>
            </div>
            <CashflowSummaryCards
              summary={data.financeSummary}
              monthLabel={data.financeMonthLabel}
              variant="hero"
            />
          </section>

          <div className="grid items-start gap-6 lg:grid-cols-2">
            <section
              className="flex flex-col gap-3"
              aria-labelledby="dash-alertas"
            >
              <h2 id="dash-alertas" className="font-serif text-lg font-medium">
                Alertas clínicos
              </h2>
              {data.alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum alerta no momento.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.alerts.map((a) => (
                    <li key={`${a.kind}-${a.patientId}`}>
                      <Link
                        href={paths.paciente(a.patientId)}
                        className="flex flex-col gap-1 rounded-md border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">{a.patientName}</span>
                          <Badge
                            variant={
                              a.kind === "reavaliacao"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {alertKindLabel(a.kind)}
                          </Badge>
                        </div>
                        <span className="text-muted-foreground">
                          {a.detail}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section
              className="flex flex-col gap-3"
              aria-labelledby="dash-atividade"
            >
              <h2
                id="dash-atividade"
                className="font-serif text-lg font-medium"
              >
                Atividade recente
              </h2>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ainda sem registros.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {data.recentActivity.map((a) => (
                    <li key={`${a.kind}-${a.id}`}>
                      <Link
                        href={paths.paciente(a.patientId)}
                        className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                      >
                        <span>
                          <span className="font-medium">{a.patientName}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            · {a.label}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-xs text-muted-foreground">
                          {formatDateBR(a.date)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}

function KpiCard({
  href,
  label,
  value,
  hint,
  valueClassName,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  valueClassName?: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-serif text-2xl font-semibold tracking-tight",
          valueClassName,
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </Link>
  );
}
