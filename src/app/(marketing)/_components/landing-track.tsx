import Link from "next/link";
import { paths } from "@/shared/constants/paths";
import { LandingShot, type LandingShotName } from "./landing-shot";

const TRACK_CARDS: readonly {
  title: string;
  body: string;
  shot: LandingShotName;
  alt: string;
}[] = [
  {
    title: "Agenda do dia",
    body: "Organize o turno, acompanhe confirmações e veja o que ainda precisa de evolução.",
    shot: "calendario",
    alt: "Agenda do dia na Movi Clinicas",
  },
  {
    title: "Paciente e PDF",
    body: "Prontuário, evoluções e documento com assinatura e CREFITO do profissional.",
    shot: "pacientes",
    alt: "Ficha de paciente na Movi Clinicas",
  },
  {
    title: "Caixa e indicadores",
    body: "Registre cobranças e acompanhe os números da clínica no mesmo sistema.",
    shot: "caixa",
    alt: "Caixa na Movi Clinicas",
  },
];

export function LandingTrack() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="landing-track-title"
      className="scroll-mt-24 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="max-w-xl">
          <h2
            id="landing-track-title"
            className="font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl"
          >
            Do atendimento ao fechamento do mês
          </h2>
          <p className="mt-4 text-muted-foreground">
            O profissional cuida do turno. A liderança acompanha caixa e
            indicadores. Sem planilha paralela.
          </p>
        </div>

        <div className="mt-14 space-y-10">
          {TRACK_CARDS.map((card, index) => (
            <article
              key={card.title}
              className="overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl"
            >
              <div className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:px-6 sm:py-5">
                <h3 className="font-serif text-xl font-semibold tracking-tight sm:text-2xl">
                  {card.title}
                </h3>
                <p className="text-sm text-pretty text-muted-foreground sm:text-base">
                  {card.body}
                </p>
              </div>
              <LandingShot
                name={card.shot}
                alt={card.alt}
                priority={index === 0}
              />
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Quer começar agora?{" "}
          <Link
            href={paths.auth.signup}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>
    </section>
  );
}
