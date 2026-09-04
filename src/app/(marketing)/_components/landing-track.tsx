import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { paths } from "@/shared/constants/paths";
import { MediaPlaceholder } from "./media-placeholder";

const TRACK_CARDS = [
  {
    title: "Agenda do dia",
    body: "Vê o turno, confirmações e o que ainda precisa de evolução.",
    label: "UI agenda · imagem",
    tone: "bg-[oklch(0.92_0.03_75)] dark:bg-[oklch(0.22_0.02_75)]",
  },
  {
    title: "Paciente e PDF",
    body: "Prontuário, evoluções e documento com assinatura / CREFITO.",
    label: "UI paciente · imagem",
    tone: "bg-[oklch(0.91_0.04_171)] dark:bg-[oklch(0.22_0.03_171)]",
  },
  {
    title: "Caixa e números",
    body: "Cobrança e visão de liderança no mesmo sistema da clínica.",
    label: "UI caixa · imagem",
    tone: "bg-[oklch(0.90_0.03_55)] dark:bg-[oklch(0.22_0.02_55)]",
  },
] as const;

export function LandingTrack() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="landing-track-title"
      className="scroll-mt-24 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2
              id="landing-track-title"
              className="font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl"
            >
              Acompanha tudo
            </h2>
            <p className="mt-4 text-muted-foreground">
              Liga o fluxo clínico ao administrativo: do atendimento ao fecho do
              mês, no mesmo fichário.
            </p>
          </div>
          <Button variant="outline" asChild className="w-fit shrink-0">
            <a href="#planos">
              Ver planos
              <IconArrowUpRight data-icon="inline-end" />
            </a>
          </Button>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TRACK_CARDS.map((card) => (
            <article
              key={card.title}
              className={`flex flex-col overflow-hidden rounded-3xl border border-border/60 ${card.tone}`}
            >
              <div className="flex flex-1 flex-col p-6 pb-4">
                <h3 className="font-serif text-xl font-semibold tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-pretty text-muted-foreground">
                  {card.body}
                </p>
              </div>
              <div className="px-4 pb-4">
                <MediaPlaceholder
                  label={card.label}
                  aspectClassName="aspect-[5/4]"
                  className="rounded-2xl border-border/50 bg-background/50 dark:bg-background/40"
                />
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Preferes começar já?{" "}
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
