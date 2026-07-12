import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { DashboardData } from "@/features/dashboard/dashboard.service";
import { paths } from "@/shared/constants/paths";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { formatCentsToBrl } from "@/shared/lib/money-utils";
import { StatCard } from "./stat-card";

export function PainelContent({
  data,
  error,
}: {
  data: DashboardData | null;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">
          Visão geral da clínica e atividade recente
        </p>
      </div>

      {error && (
        <div className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="text-destructive">{error}</p>
          {error.includes("organização") && (
            <Button asChild size="sm">
              <Link href={paths.organizacao}>Criar clínica</Link>
            </Button>
          )}
        </div>
      )}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              number={String(data.stats.activePatients)}
              label={`Pacientes ativos (de ${data.stats.totalPatients})`}
            />
            <StatCard
              number={String(data.stats.totalExercises)}
              label="Atividades na biblioteca"
            />
            <StatCard
              number={String(data.stats.totalEvaluations)}
              label="Avaliações registradas"
            />
            <StatCard
              number={String(data.stats.sessionsThisWeek)}
              label="Evoluções nesta semana"
            />
          </div>

          <section className="rounded-md border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Caixa — {data.financeMonthLabel}
              </p>
              <Link
                href={paths.caixa}
                className="text-xs font-medium text-primary hover:underline"
              >
                Abrir caixa
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <StatCard
                number={formatCentsToBrl(data.financeSummary.incomeCents)}
                label="Entradas do mês"
              />
              <StatCard
                number={formatCentsToBrl(data.financeSummary.expenseCents)}
                label="Saídas do mês"
              />
              <StatCard
                number={formatCentsToBrl(data.financeSummary.balanceCents)}
                label="Saldo do mês"
              />
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`${paths.pacientes}?novo=1`}>Novo paciente</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={paths.agenda}>Ver agenda</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={paths.biblioteca}>Biblioteca</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={paths.pacientes}>Pacientes</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={paths.buscar}>Buscar</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={paths.configuracoes}>Configurações</Link>
            </Button>
          </div>

          <section className="rounded-md border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Hoje na agenda
              </p>
              <Link
                href={paths.agenda}
                className="text-xs font-medium text-primary hover:underline"
              >
                Abrir agenda
              </Link>
            </div>
            {data.todayAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum agendamento para hoje.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.todayAppointments.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={paths.paciente(a.patientId)}
                      className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                    >
                      <span>
                        <span className="font-mono text-xs font-medium">
                          {a.time || "—"}
                        </span>
                        <span className="ml-2 font-medium">{a.patientName}</span>
                        <span className="ml-2 text-muted-foreground capitalize">
                          · {a.status}
                        </span>
                      </span>
                      {a.duration > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {a.duration} min
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-md border border-border bg-card p-4">
              <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Alertas clínicos
              </p>
              {data.alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum alerta no momento.
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.alerts.map((a) => (
                    <li key={`${a.kind}-${a.patientId}`}>
                      <Link
                        href={paths.paciente(a.patientId)}
                        className="block rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                      >
                        <span className="font-medium">{a.patientName}</span>
                        <span className="mt-0.5 block text-muted-foreground">
                          {a.detail}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-md border border-border bg-card p-4">
              <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Atividade recente
              </p>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ainda sem registros.
                </p>
              ) : (
                <ul className="space-y-2">
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
      )}
    </div>
  );
}
