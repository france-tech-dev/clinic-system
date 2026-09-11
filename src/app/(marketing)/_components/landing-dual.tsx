import { LandingShot, type LandingShotName } from "./landing-shot";

const DUAL: readonly {
  title: string;
  body: string;
  shot: LandingShotName;
  alt: string;
}[] = [
  {
    title: "Para quem atende",
    body: "Agenda, paciente, anamnese e avaliações no fluxo do profissional — sem perder o contexto do atendimento.",
    shot: "lista",
    alt: "Lista de pacientes na Movi Clinicas",
  },
  {
    title: "Para quem gerencia",
    body: "Dashboard, caixa, equipe e planos — a visão da liderança sobre a clínica.",
    shot: "dash",
    alt: "Dashboard da clínica na Movi Clinicas",
  },
];

export function LandingDual() {
  return (
    <section
      aria-labelledby="landing-dual-title"
      className="scroll-mt-24 border-b border-border"
    >
      <h2 id="landing-dual-title" className="sr-only">
        Dois modos no mesmo sistema
      </h2>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-6 lg:py-28">
        {DUAL.map((item) => (
          <article
            key={item.title}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl"
          >
            <div className="border-b border-border p-5 sm:p-6">
              <h3 className="font-serif text-2xl tracking-tight sm:text-3xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground sm:text-base">
                {item.body}
              </p>
            </div>
            <LandingShot name={item.shot} alt={item.alt} />
          </article>
        ))}
      </div>
    </section>
  );
}
