import Link from "next/link";
import { SiteHeader } from "@/components/templates/SiteHeader/site-header";
import { Button } from "@/components/ui/button";
import { paths } from "@/shared/constants/paths";
import { OrgContextError, requireOrgId } from "@/shared/lib/org-context";
import { ensureDefaultExercises } from "@/shared/lib/seed-exercises";
import { getDashboardData } from "@/features/dashboard/dashboard.service";

export default async function PainelPage() {
  let data = null;
  let error: string | null = null;

  try {
    const { organizationId } = await requireOrgId();
    await ensureDefaultExercises(organizationId);
    data = await getDashboardData(organizationId);
  } catch (e) {
    error =
      e instanceof OrgContextError
        ? e.message
        : "Não foi possível carregar o painel.";
  }

  return (
    <>
      <SiteHeader title="Painel" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            Painel
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
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
                          <span className="ml-2 font-medium">
                            {a.patientName}
                          </span>
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
    </>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="font-serif text-3xl font-semibold text-primary">{number}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}
