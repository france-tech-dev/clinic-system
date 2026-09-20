"use client";

import { BillingPlan } from "@prisma/enums";
import {
  BILLING_PLAN_DEFS,
  EXTRA_SEAT_PRICE_BRL,
  TRIAL_DAYS,
} from "@/shared/constants/billing-plans";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";
import { useLandingReveal } from "./use-landing-reveal";
import {
  CheckIcon,
  LandingBtnLine,
  LandingBtnSun,
  landingContainer,
  landingDisplay,
  landingSectionScroll,
} from "./landing-ui";

const LANDING_INCLUDED = [
  "Agenda, pacientes, prontuário e evoluções",
  "Anamnese, avaliações e caixa",
  "Interpretação assistida por IA dos protocolos",
  "Dashboard, busca e configurações da clínica",
] as const;

function formatPrice(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
}

function planSeatLine(plan: (typeof BILLING_PLAN_DEFS)[number]) {
  if (plan.id === BillingPlan.SOLO) {
    return {
      seats: "1 profissional",
      per: `R$ ${plan.priceMonthlyBrl} por profissional`,
    };
  }
  if (plan.id === BillingPlan.PRO) {
    return {
      seats: `Até ${plan.includedProfessionals} profissionais`,
      per: `Cerca de R$ ${Math.round(plan.priceMonthlyBrl / plan.includedProfessionals)} por profissional`,
    };
  }
  return {
    seats: `Até ${plan.includedProfessionals} profissionais`,
    per: `Cerca de R$ ${Math.round(plan.priceMonthlyBrl / plan.includedProfessionals)} por profissional. Profissional adicional: R$ ${EXTRA_SEAT_PRICE_BRL}/mês.`,
  };
}

const CARD_STYLES: Record<
  BillingPlan,
  { bg: string; radius: string; onDark?: boolean }
> = {
  [BillingPlan.SOLO]: {
    bg: "bg-[var(--movi-tint-sun)]",
    radius: "rounded-[40px_40px_40px_100px]",
  },
  [BillingPlan.PRO]: {
    bg: "bg-[var(--movi-band)]",
    radius: "rounded-[40px_40px_100px_40px]",
    onDark: true,
  },
  [BillingPlan.ENTERPRISE]: {
    bg: "bg-[var(--movi-tint-sky)]",
    radius: "rounded-[40px_40px_40px_100px]",
  },
};

export function LandingPlans() {
  const ref = useLandingReveal("[data-reveal]");

  return (
    <section
      ref={ref}
      id="planos"
      aria-labelledby="landing-plans-title"
      className={cn(landingSectionScroll, "py-24 md:py-[120px]")}
    >
      <div className={landingContainer}>
        <h2
          id="landing-plans-title"
          data-reveal
          className={cn(
            landingDisplay,
            "max-w-[760px] text-[clamp(2rem,4.5vw,3.375rem)] leading-[1.06]",
          )}
        >
          Planos pelo tamanho da equipe
        </h2>
        <p
          data-reveal
          className="mt-5 max-w-[640px] text-xl text-[var(--movi-muted)]"
        >
          Todas as funções em todos os planos. O que muda é quantos profissionais
          atendem na clínica. Teste {TRIAL_DAYS} dias e escolha o plano quando
          estiver pronto.
        </p>

        <div
          data-reveal
          className="mt-12 grid items-stretch gap-6 md:mt-14 md:grid-cols-3"
        >
          {BILLING_PLAN_DEFS.map((plan) => {
            const style = CARD_STYLES[plan.id];
            const seats = planSeatLine(plan);
            const onDark = style.onDark;

            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col px-8 pt-10 pb-9 sm:px-9",
                  style.bg,
                  style.radius,
                )}
              >
                {plan.recommended ? (
                  <span className="absolute -top-4 right-[52px] whitespace-nowrap rounded-full bg-[var(--movi-coral)] px-4 py-1.5 text-sm font-extrabold text-[var(--movi-ink)]">
                    Mais indicado
                  </span>
                ) : null}
                <h3
                  className={cn(
                    landingDisplay,
                    "text-[32px] leading-[1.1]",
                    onDark && "text-[var(--movi-on-dark)]",
                  )}
                >
                  {plan.name}
                </h3>
                <p
                  className={cn(
                    "mt-1.5 text-[17px]",
                    onDark
                      ? "text-[var(--movi-on-dark-muted)]"
                      : "text-[var(--movi-muted)]",
                  )}
                >
                  {plan.id === BillingPlan.SOLO
                    ? "Atendimento individual"
                    : plan.id === BillingPlan.PRO
                      ? "Equipes pequenas"
                      : "Clínicas maiores"}
                </p>
                <div className="mt-7 flex items-baseline gap-1.5">
                  <span
                    className={cn(
                      landingDisplay,
                      "text-[50px] leading-none",
                      onDark && "text-[var(--movi-on-dark)]",
                    )}
                  >
                    {formatPrice(plan.priceMonthlyBrl)}
                  </span>
                  <span
                    className={cn(
                      "text-base",
                      onDark
                        ? "text-[var(--movi-on-dark-muted)]"
                        : "text-[var(--movi-muted)]",
                    )}
                  >
                    /mês
                  </span>
                </div>
                <p
                  className={cn(
                    "mt-3.5 font-extrabold",
                    onDark
                      ? "text-[var(--movi-on-dark)]"
                      : "text-[var(--movi-ink)]",
                  )}
                >
                  {seats.seats}
                </p>
                <p
                  className={cn(
                    "mt-0.5 text-[15px]",
                    onDark
                      ? "text-[var(--movi-on-dark-muted)]"
                      : "text-[var(--movi-muted)]",
                  )}
                >
                  {seats.per}
                </p>
                <div className="mt-auto pt-9">
                  {onDark ? (
                    <LandingBtnSun
                      href={paths.auth.signup}
                      className="w-full"
                    >
                      Testar {TRIAL_DAYS} dias grátis
                    </LandingBtnSun>
                  ) : (
                    <LandingBtnLine
                      href={paths.auth.signup}
                      className="w-full"
                    >
                      Testar {TRIAL_DAYS} dias grátis
                    </LandingBtnLine>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div
          data-reveal
          className="mt-12 grid gap-6 md:mt-14 md:grid-cols-[260px_minmax(0,1fr)] md:gap-8 md:items-start"
        >
          <h3
            className={cn(
              landingDisplay,
              "text-[26px] leading-[1.2]",
            )}
          >
            Em todos os planos
          </h3>
          <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-x-10">
            {LANDING_INCLUDED.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckIcon className="mt-1 shrink-0" />
                <span className="text-[var(--movi-row)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-10 text-sm text-[var(--movi-muted-2)]">
          Valores sujeitos à confirmação no checkout.
        </p>
      </div>
    </section>
  );
}
