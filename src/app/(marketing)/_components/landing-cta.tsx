"use client";

import { paths } from "@/shared/constants/paths";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";
import { cn } from "@/shared/lib/utils";
import { LandingMascot } from "./landing-brand-mark";
import { useLandingReveal } from "./use-landing-reveal";
import {
  LandingTextLink,
  LandingTrialCta,
  landingContainer,
  landingDisplay,
} from "./landing-ui";

export function LandingCta() {
  const ref = useLandingReveal("[data-reveal]");

  return (
    <section
      ref={ref}
      aria-labelledby="landing-cta-title"
      className="overflow-hidden bg-[var(--movi-tint-lilac)]"
    >
      <div
        className={cn(
          landingContainer,
          "grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_400px] md:gap-16",
        )}
      >
        <div data-reveal className="py-20 md:py-[104px]">
          <h2
            id="landing-cta-title"
            className={cn(
              landingDisplay,
              "max-w-[680px] text-[clamp(2.25rem,5vw,3.875rem)] leading-[1.03] text-[var(--movi-ink)]",
            )}
          >
            Comece o teste de {TRIAL_DAYS}&nbsp;dias hoje
          </h2>
          <p className="mt-5 max-w-[560px] text-[clamp(1.1rem,2vw,1.3125rem)] font-bold text-[var(--movi-ink)]">
            Crie a organização, convide a equipe e use o Movi por{" "}
            {TRIAL_DAYS}&nbsp;dias. Depois, escolha o plano.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-7">
            <LandingTrialCta className="h-[60px] px-[38px] text-[19px]" />
            <LandingTextLink
              href={paths.auth.login}
              className="text-[var(--movi-ink)] hover:text-[var(--movi-green-deep)]"
            >
              Já tenho conta
            </LandingTextLink>
          </div>
        </div>
        <div
          data-reveal
          className="flex justify-center py-10 md:justify-end md:py-14"
        >
          <LandingMascot size={360} className="h-auto w-full max-w-[400px]" />
        </div>
      </div>
    </section>
  );
}
