import { MediaPlaceholder } from "./media-placeholder";

export function LandingShowcase() {
  return (
    <section
      id="produto"
      aria-labelledby="landing-showcase-title"
      className="scroll-mt-24 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <h2
          id="landing-showcase-title"
          className="mx-auto max-w-2xl text-center font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl"
        >
          Simplifica o turno
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          O dia da clínica num ecrã: agenda, paciente e o que falta registar —
          sem saltar entre ferramentas.
        </p>
        <div className="mx-auto mt-14 max-w-4xl animate-[landing-fade-up_0.85s_ease-out_0.08s_both]">
          <MediaPlaceholder
            label="Mockup da agenda · imagem a adicionar"
            aspectClassName="aspect-[16/10]"
            className="rounded-3xl border-border bg-muted/50 shadow-sm dark:bg-card"
          />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Pré-visualização ilustrativa — espaço reservado para mockup do
            produto.
          </p>
        </div>
      </div>
    </section>
  );
}
