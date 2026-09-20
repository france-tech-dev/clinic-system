"use client";

import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { LANDING_ASSETS } from "./landing-assets";
import { useLandingReveal } from "./use-landing-reveal";
import {
  landingContainer,
  landingDisplay,
  landingSectionScroll,
} from "./landing-ui";

const STEPS = [
  {
    n: "1",
    nBg: "var(--movi-sun)",
    title: "Agende",
    body: "Veja o dia, a semana ou o mês da equipe. Cada sessão mostra o status: agendado, realizado, faltou, cancelado ou com evolução.",
    bullets: [
      "Filtre por profissional, paciente e status",
      "Alterne entre lista e calendário",
    ],
    bulletColor: "var(--movi-sun)",
    frameBg: "var(--movi-tint-sun)",
    frameRadius: "rounded-[48px_48px_48px_96px]",
    shotRadius: "rounded-[8px_8px_8px_36px]",
    image: LANDING_ASSETS.agendaSemana,
    alt: "Semana da agenda com sessões e botões Dia, Semana e Mês",
    reverse: false,
  },
  {
    n: "2",
    nBg: "var(--movi-sky)",
    title: "Atenda e registre",
    body: "Prontuário, anamnese e avaliações de cada paciente no mesmo lugar. A evolução fica registrada, assinada e com o seu registro profissional.",
    bullets: [
      "Anamnese por especialidade",
      "Avaliações estruturadas com interpretação assistida por IA",
    ],
    bulletColor: "var(--movi-sky)",
    frameBg: "var(--movi-tint-sky)",
    frameRadius: "rounded-[48px_48px_96px_48px]",
    shotRadius: "rounded-[8px_8px_36px_8px]",
    image: LANDING_ASSETS.pacientes,
    alt: "Lista de pacientes com status, responsável e avaliações e evoluções registradas",
    reverse: true,
  },
  {
    n: "3",
    nBg: "var(--movi-coral)",
    title: "Cobre e acompanhe",
    body: "Veja entradas, saídas e o que ainda falta receber e pagar. Exporte em CSV e feche o mês sem planilha paralela.",
    bullets: [
      "Fluxo de caixa por período",
      "Filtros por método de pagamento e por profissional",
    ],
    bulletColor: "var(--movi-coral)",
    frameBg: "var(--movi-tint-coral)",
    frameRadius: "rounded-[48px_48px_48px_96px]",
    shotRadius: "rounded-[8px_8px_8px_36px]",
    image: LANDING_ASSETS.caixa,
    alt: "Caixa com entradas, saídas, a receber e fluxo de caixa do mês",
    reverse: false,
  },
] as const;

export function LandingProduto() {
  const ref = useLandingReveal("[data-reveal]");

  return (
    <section
      ref={ref}
      id="produto"
      aria-labelledby="landing-produto-title"
      className={cn(landingSectionScroll, "pb-24 pt-6 md:pb-[120px] md:pt-6")}
    >
      <div className={landingContainer}>
        <h2
          id="landing-produto-title"
          data-reveal
          className={cn(
            landingDisplay,
            "max-w-[760px] text-[clamp(2rem,4.5vw,3.375rem)] leading-[1.06]",
          )}
        >
          Do primeiro agendamento ao fechamento do mês
        </h2>

        <div className="mt-16 space-y-20 md:mt-24 md:space-y-[120px]">
          {STEPS.map((step) => (
            <div
              key={step.n}
              data-reveal
              className={cn(
                "grid items-center gap-10 md:grid-cols-12 md:gap-6",
              )}
            >
              <div
                className={cn(
                  "md:col-span-5",
                  step.reverse
                    ? "md:col-start-8 md:row-start-1 md:pl-8"
                    : "md:pr-8",
                )}
              >
                <div
                  className={cn(
                    landingDisplay,
                    "flex size-[60px] items-center justify-center rounded-full text-[30px] text-[var(--movi-ink)]",
                  )}
                  style={{ background: step.nBg }}
                >
                  {step.n}
                </div>
                <h3
                  className={cn(
                    landingDisplay,
                    "mt-6 text-[clamp(1.75rem,3vw,2.625rem)] leading-[1.1]",
                  )}
                >
                  {step.title}
                </h3>
                <p className="mt-4 text-[19px] text-[var(--movi-muted)]">
                  {step.body}
                </p>
                <div className="mt-7 flex flex-col gap-3">
                  {step.bullets.map((b) => (
                    <div key={b} className="flex items-center gap-3.5">
                      <span
                        className="size-3 shrink-0 rounded-full"
                        style={{ background: step.bulletColor }}
                      />
                      <span className="font-bold text-[var(--movi-ink)]">
                        {b}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className={cn(
                  "md:col-span-7",
                  step.reverse && "md:col-start-1 md:row-start-1",
                )}
              >
                <div className={cn("p-6 sm:p-10", step.frameRadius)} style={{ background: step.frameBg }}>
                  <div
                    className={cn(
                      "aspect-[1.85] overflow-hidden border border-[var(--movi-border)] bg-[var(--movi-surface)]",
                      step.shotRadius,
                    )}
                  >
                    <Image
                      src={step.image}
                      alt={step.alt}
                      width={900}
                      height={486}
                      className="size-full object-cover object-left-top"
                      sizes="(max-width: 768px) 100vw, 55vw"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
