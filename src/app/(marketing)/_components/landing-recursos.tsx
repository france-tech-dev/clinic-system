"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { useLandingReveal } from "./use-landing-reveal";
import {
  landingContainer,
  landingDisplay,
  landingSectionScroll,
} from "./landing-ui";

function FeatureRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border-t border-[var(--movi-border-strong)] py-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5">
      <div className="font-extrabold text-[var(--movi-heading)]">{label}</div>
      <div className="text-[var(--movi-row)]">{children}</div>
    </div>
  );
}

export function LandingRecursos() {
  const ref = useLandingReveal("[data-reveal]");

  return (
    <section
      ref={ref}
      id="recursos"
      aria-labelledby="landing-recursos-title"
      className={cn(
        landingSectionScroll,
        "bg-[var(--movi-surface)] py-24 md:py-[120px]",
      )}
    >
      <div className={landingContainer}>
        <h2
          id="landing-recursos-title"
          data-reveal
          className={cn(
            landingDisplay,
            "max-w-[820px] text-[clamp(2rem,4.5vw,3.375rem)] leading-[1.06]",
          )}
        >
          Feito para quem atende e para quem gerencia
        </h2>
        <p
          data-reveal
          className="mt-5 max-w-[760px] text-xl text-[var(--movi-muted)]"
        >
          Cada pessoa da equipe vê o que precisa. As permissões seguem a função.
        </p>

        <div
          data-reveal
          className="mt-12 grid items-stretch gap-6 md:mt-16 md:grid-cols-2"
        >
          <div className="rounded-[48px_48px_48px_120px] bg-[var(--movi-tint-sage)] px-8 py-9 sm:px-11 sm:pt-11 sm:pb-9">
            <h3
              className={cn(
                landingDisplay,
                "text-[clamp(1.5rem,2.5vw,2rem)] leading-[1.15]",
              )}
            >
              Para quem atende
            </h3>
            <div className="mt-7">
              <FeatureRow label="Agenda">
                Turnos, confirmações e evoluções pendentes do dia.
              </FeatureRow>
              <FeatureRow label="Pacientes">
                Prontuário e histórico em um só lugar.
              </FeatureRow>
              <FeatureRow label="Anamnese">
                Formulários por especialidade.
              </FeatureRow>
              <FeatureRow label="Avaliações">
                Instrumentos estruturados, como GMFM-88, PEDI e Perfil Sensorial.
              </FeatureRow>
              <FeatureRow label="Documentos clínicos">
                Evolução com assinatura e registro profissional.
              </FeatureRow>
              <FeatureRow label="Inteligência artificial">
                Interpretação assistida por IA dos protocolos.
              </FeatureRow>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-[48px_48px_120px_48px] bg-[var(--movi-tint-sun)] px-8 py-9 sm:px-11 sm:pt-11 sm:pb-9">
              <h3
                className={cn(
                  landingDisplay,
                  "text-[clamp(1.5rem,2.5vw,2rem)] leading-[1.15]",
                )}
              >
                Para quem gerencia
              </h3>
              <div className="mt-7">
                <FeatureRow label="Caixa">
                  Cobranças e fluxo financeiro da clínica.
                </FeatureRow>
                <FeatureRow label="Dashboard">
                  Indicadores para a liderança.
                </FeatureRow>
                <FeatureRow label="Equipe">
                  Convites e acesso restrito à sua clínica.
                </FeatureRow>
              </div>
            </div>

            <div className="rounded-[48px] bg-[var(--movi-tint-lilac)] px-8 py-9 sm:px-11">
              <h3
                className={cn(
                  landingDisplay,
                  "text-[clamp(1.35rem,2vw,1.625rem)] leading-[1.15]",
                )}
              >
                Em desenvolvimento
              </h3>
              <div className="mt-[18px]">
                <FeatureRow label="Portal do responsável">
                  Ainda não disponível.
                </FeatureRow>
                <FeatureRow label="Lembretes por WhatsApp">
                  Lembretes de consulta. Ainda não disponível.
                </FeatureRow>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
