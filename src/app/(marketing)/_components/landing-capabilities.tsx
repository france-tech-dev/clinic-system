const READY = [
  {
    title: "Agenda e pacientes",
    body: "Turno do dia, evoluções e PDF com assinatura / CREFITO do profissional.",
  },
  {
    title: "Anamnese e avaliações",
    body: "Formulários por especialidade e instrumentos estruturados (ex.: GMFM-88).",
  },
  {
    title: "Caixa e dashboard",
    body: "Cobrança e KPIs para a liderança — no mesmo isolamento por clínica.",
  },
  {
    title: "Planos e equipa",
    body: "Starter, Pro e Enterprise com features gated e convidados por organização.",
  },
] as const;

const COMING = [
  "Portal do responsável — em evolução",
  "Lembretes de consulta por WhatsApp — em evolução",
] as const;

export function LandingCapabilities() {
  return (
    <section
      aria-labelledby="landing-cap-title"
      className="scroll-mt-24 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-2xl">
          <h2
            id="landing-cap-title"
            className="font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl"
          >
            O que já trabalha na clínica
          </h2>
          <p className="mt-4 text-muted-foreground">
            Destacamos o que está entregue. O que ainda está a caminho fica
            marcado com honestidade.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {READY.map((item) => (
            <article
              key={item.title}
              className="rounded-3xl border border-border bg-card p-6 sm:p-8"
            >
              <h3 className="font-serif text-xl font-semibold tracking-tight">
                {item.title}
              </h3>
              <p className="mt-3 text-sm text-pretty text-muted-foreground">
                {item.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-12 max-w-xl">
          <h3 className="text-sm font-medium text-muted-foreground">
            Em evolução
          </h3>
          <ul className="mt-3 space-y-2">
            {COMING.map((item) => (
              <li
                key={item}
                className="border-b border-border/70 py-2 text-sm text-muted-foreground last:border-0"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
