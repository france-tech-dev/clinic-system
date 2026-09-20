"use client";

import Image from "next/image";
import { cn } from "@/shared/lib/utils";
import { LANDING_ASSETS } from "./landing-assets";
import { useLandingReveal } from "./use-landing-reveal";
import {
  landingContainer,
  landingDisplay,
} from "./landing-ui";

const LINES = [
  "Avaliações, pacientes e evoluções por mês",
  "Dias e horários com mais atendimentos",
  "Alertas e aniversários dos pacientes",
] as const;

export function LandingMobile() {
  const ref = useLandingReveal("[data-reveal]");

  return (
    <section
      ref={ref}
      aria-labelledby="landing-mobile-title"
      className="py-24 md:py-[112px]"
    >
      <div
        className={cn(
          landingContainer,
          "grid items-center gap-12 md:grid-cols-[minmax(0,520px)_minmax(0,1fr)] md:gap-[88px]",
        )}
      >
        <div
          data-reveal
          className="flex justify-center rounded-[48px_48px_48px_96px] bg-[var(--movi-tint-sky)] px-8 py-12 sm:px-10"
        >
          <div className="h-[480px] w-[260px] overflow-hidden rounded-[46px] border-[10px] border-[var(--movi-band)] bg-[var(--movi-surface)] sm:h-[560px] sm:w-[300px]">
            <Image
              src={LANDING_ASSETS.dashMobile}
              alt="Dashboard do Movi no celular, com gráficos de atividade e dias mais movimentados"
              width={600}
              height={1120}
              className="size-full object-cover object-top"
              sizes="300px"
            />
          </div>
        </div>

        <div data-reveal>
          <h2
            id="landing-mobile-title"
            className={cn(
              landingDisplay,
              "max-w-[560px] text-[clamp(2rem,4vw,3.25rem)] leading-[1.06]",
            )}
          >
            Acompanhe a clínica de onde estiver
          </h2>
          <p className="mt-[22px] max-w-[520px] text-xl text-[var(--movi-muted)]">
            O dashboard mostra a atividade dos últimos 6 meses e os dias e
            horários mais movimentados, para você organizar a equipe com dados.
          </p>
          <div className="mt-8 max-w-[520px]">
            {LINES.map((line, i) => (
              <div
                key={line}
                className={cn(
                  "border-t border-[var(--movi-border-strong)] py-4 font-extrabold text-[var(--movi-heading)]",
                  i === LINES.length - 1 && "border-b",
                )}
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
