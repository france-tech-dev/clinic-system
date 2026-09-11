import { LandingShot } from "./landing-shot";

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
          A rotina da clínica, sem troca de ferramenta
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Veja o dia de atendimento, o paciente e o que ainda falta registrar —
          tudo na mesma tela.
        </p>
        <div className="mt-14 animate-[landing-fade-up_0.85s_ease-out_0.08s_both]">
          <div className="overflow-hidden rounded-2xl border border-border shadow-sm sm:rounded-3xl">
            <LandingShot
              name="calendario"
              alt="Tela da agenda na Movi Clinicas"
              priority
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Imagem ilustrativa da agenda no produto.
          </p>
        </div>
      </div>
    </section>
  );
}
