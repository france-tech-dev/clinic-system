import { MediaPlaceholder } from "./media-placeholder";

const DUAL = [
  {
    title: "O turno clínico",
    body: "Agenda, paciente, anamnese e avaliações estruturadas no fluxo do profissional.",
    label: "Mockup turno · imagem a adicionar",
  },
  {
    title: "A liderança da clínica",
    body: "Dashboard, caixa, equipa e planos — a visão de quem gere a organização.",
    label: "Mockup liderança · imagem a adicionar",
  },
] as const;

export function LandingDual() {
  return (
    <section
      aria-labelledby="landing-dual-title"
      className="scroll-mt-24 border-b border-border"
    >
      <h2 id="landing-dual-title" className="sr-only">
        Dois modos no mesmo sistema
      </h2>
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
        {DUAL.map((item) => (
          <article
            key={item.title}
            className="flex flex-col overflow-hidden rounded-3xl border border-border bg-muted/35 dark:bg-card"
          >
            <div className="p-6 sm:p-8">
              <h3 className="font-serif text-2xl tracking-tight sm:text-3xl">
                {item.title}
              </h3>
              <p className="mt-3 max-w-md text-sm text-pretty text-muted-foreground sm:text-base">
                {item.body}
              </p>
            </div>
            <div className="mt-auto px-4 pb-4 sm:px-6 sm:pb-6">
              <MediaPlaceholder
                label={item.label}
                aspectClassName="aspect-[16/11]"
                className="rounded-2xl bg-background/60 dark:bg-background/30"
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
