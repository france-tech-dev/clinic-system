"use client";

import { cn } from "@/shared/lib/utils";
import { useLandingReveal } from "./use-landing-reveal";
import {
  landingContainer,
  landingDisplay,
} from "./landing-ui";

const POINTS = [
  {
    border: "var(--movi-sage)",
    title: "Dados separados por clínica",
    body: "Cada organização acessa exclusivamente as próprias informações.",
  },
  {
    border: "var(--movi-sun)",
    title: "Acesso por função",
    body: "O profissional usa o fluxo de atendimento. A liderança acompanha dashboard, caixa e equipe.",
  },
  {
    border: "var(--movi-sky)",
    title: "Controle da equipe",
    body: "Convites e permissões ficam dentro da sua organização.",
  },
  {
    border: "var(--movi-lilac)",
    title: "Privacidade e LGPD",
    body: "Projetado com foco em menor exposição de dados e maior controle de acesso.",
  },
] as const;

export function LandingSecurity() {
  const ref = useLandingReveal("[data-reveal]");

  return (
    <section
      ref={ref}
      aria-labelledby="landing-security-title"
      className="bg-[var(--movi-band)] py-24 md:py-[112px]"
    >
      <div
        className={cn(
          landingContainer,
          "grid gap-12 md:grid-cols-12 md:gap-6 md:items-start",
        )}
      >
        <div data-reveal className="md:col-span-5">
          <h2
            id="landing-security-title"
            className={cn(
              landingDisplay,
              "text-[clamp(2rem,4vw,3.25rem)] leading-[1.06] text-[var(--movi-on-dark)]",
            )}
          >
            Os dados de cada clínica ficam separados
          </h2>
          <p className="mt-[22px] max-w-[440px] text-xl text-[var(--movi-on-dark-muted)]">
            Privacidade e permissões fazem parte do produto. Não são um extra.
          </p>
        </div>

        <div
          data-reveal
          className="grid gap-10 sm:grid-cols-2 md:col-span-6 md:col-start-7 md:gap-10"
        >
          {POINTS.map((p) => (
            <div
              key={p.title}
              className="border-t-2 pt-5"
              style={{ borderColor: p.border }}
            >
              <h3
                className={cn(
                  landingDisplay,
                  "text-2xl leading-[1.2] text-[var(--movi-on-dark)]",
                )}
              >
                {p.title}
              </h3>
              <p className="mt-2.5 text-[17px] text-[var(--movi-on-dark-muted)]">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
