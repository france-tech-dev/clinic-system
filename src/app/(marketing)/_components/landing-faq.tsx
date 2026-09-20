"use client";

import { cn } from "@/shared/lib/utils";
import { useLandingReveal } from "./use-landing-reveal";
import {
  landingContainer,
  landingDisplay,
  landingSectionScroll,
} from "./landing-ui";

const FAQS = [
  {
    q: "O Movi serve para qual especialidade?",
    a: "O Movi é um sistema de saúde integrado para clínicas de várias especialidades. A anamnese é organizada por especialidade e as avaliações estruturadas incluem instrumentos como GMFM-88, PEDI e Perfil Sensorial.",
  },
  {
    q: "O que está incluído?",
    a: "Todas as funções estão em todos os planos. O que muda é o número de profissionais.",
  },
  {
    q: "Serve para o tamanho da minha clínica?",
    a: "Há plano para 1 profissional, para até 3 e para até 9. No Enterprise, cada profissional adicional custa R$ 59/mês.",
  },
  {
    q: "Como testar antes de assinar?",
    a: "Crie a conta, convide a equipe e use por 7 dias. Depois, escolha o plano que cabe na sua clínica.",
  },
  {
    q: "Os dados dos pacientes ficam isolados?",
    a: "Sim. Cada clínica acessa exclusivamente as próprias informações, com acesso por função.",
  },
  {
    q: "Tem inteligência artificial?",
    a: "Sim. A interpretação assistida por IA dos protocolos está incluída em todos os planos.",
  },
] as const;

export function LandingFaq() {
  const ref = useLandingReveal("[data-reveal]");

  return (
    <section
      ref={ref}
      id="faq"
      aria-labelledby="landing-faq-title"
      className={cn(
        landingSectionScroll,
        "bg-[var(--movi-surface)] py-24 md:py-[112px]",
      )}
    >
      <div className={landingContainer}>
        <h2
          id="landing-faq-title"
          data-reveal
          className={cn(
            landingDisplay,
            "text-[clamp(2rem,4vw,3.25rem)] leading-[1.06]",
          )}
        >
          Dúvidas frequentes
        </h2>
        <div
          data-reveal
          className="mt-12 grid gap-x-20 md:mt-14 md:grid-cols-2"
        >
          {FAQS.map((item, i) => {
            const isLastRow = i >= FAQS.length - 2;
            return (
              <div
                key={item.q}
                className={cn(
                  "border-t border-[var(--movi-border)] py-7",
                  isLastRow && "border-b",
                )}
              >
                <h3
                  className={cn(
                    landingDisplay,
                    "text-[clamp(1.2rem,2vw,1.5625rem)] leading-[1.2]",
                  )}
                >
                  {item.q}
                </h3>
                <p className="mt-3 max-w-[520px] text-lg text-[var(--movi-muted)]">
                  {item.a}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
