"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { paths } from "@/shared/constants/paths";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";
import { cn } from "@/shared/lib/utils";
import { LANDING_ASSETS } from "./landing-assets";
import { LandingMascot } from "./landing-brand-mark";
import {
  gsap,
  prefersReducedMotion,
  registerLandingMotion,
  useGSAP,
} from "./landing-motion";
import {
  LANDING_DEFAULT_SPECIALTY_INDEX,
  LANDING_SPECIALTIES,
} from "./landing-specialty";
import {
  LandingTextLink,
  LandingTrialCta,
  landingContainer,
  landingDisplay,
  landingSectionScroll,
} from "./landing-ui";

registerLandingMotion();

export function LandingHero() {
  const rootRef = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState(LANDING_DEFAULT_SPECIALTY_INDEX);
  const cur = LANDING_SPECIALTIES[selected]!;

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const root = rootRef.current;
      if (!root) return;

      const tl = gsap.timeline({
        defaults: { ease: "power2.out", duration: 0.65 },
      });
      tl.from("[data-hero-copy]", { opacity: 0, y: 22, stagger: 0.08 })
        .from("[data-hero-stage]", { opacity: 0, y: 32, duration: 0.8 }, "-=0.35")
        .from(
          "[data-hero-float]",
          { opacity: 0, y: 16, stagger: 0.1, duration: 0.5 },
          "-=0.45",
        );

      gsap.to("[data-hero-mascot]", {
        y: -10,
        duration: 2.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to("[data-hero-phone]", {
        y: 8,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 0.4,
      });
    },
    { scope: rootRef },
  );

  return (
    <section
      ref={rootRef}
      id="topo"
      aria-labelledby="landing-hero-title"
      className={cn(landingSectionScroll, "pb-20 pt-10 md:pb-32 md:pt-14")}
    >
      <div
        className={cn(
          landingContainer,
          "grid items-center gap-12 md:grid-cols-[minmax(0,560px)_minmax(0,1fr)] md:gap-16",
        )}
      >
        <div>
          <h1
            id="landing-hero-title"
            data-hero-copy
            className={cn(
              landingDisplay,
              "text-[clamp(2.25rem,5vw,3.875rem)] leading-[1.05]",
            )}
          >
            Um sistema de saúde que se move com a sua clínica
          </h1>
          <p
            data-hero-copy
            className="mt-6 max-w-[520px] text-[clamp(1.05rem,2vw,1.3125rem)] leading-[1.55] text-[var(--movi-muted)]"
          >
            Agenda, prontuário, avaliações e financeiro em um só lugar, para
            clínicas de qualquer especialidade.
          </p>

          <p
            data-hero-copy
            className="mt-11 mb-3.5 text-[17px] font-extrabold text-[var(--movi-ink)]"
          >
            Qual é a sua especialidade?
          </p>
          <div data-hero-copy className="flex flex-wrap gap-2.5">
            {LANDING_SPECIALTIES.map((spec, i) => {
              const active = i === selected;
              return (
                <button
                  key={spec.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelected(i)}
                  className="inline-flex h-12 cursor-pointer items-center gap-2.5 rounded-full border-2 py-0 pr-5 pl-4 text-base font-extrabold text-[var(--movi-ink)] transition-[background,border-color] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--movi-action)]"
                  style={{
                    background: active ? spec.color : "var(--movi-surface)",
                    borderColor: active ? spec.color : "var(--movi-border)",
                  }}
                >
                  <span
                    className="size-3 shrink-0 rounded-full"
                    style={{
                      background: active ? "#2B3D30" : spec.color,
                    }}
                  />
                  <span>{spec.label}</span>
                </button>
              );
            })}
          </div>

          <div
            data-hero-copy
            className="mt-5 flex max-w-[540px] gap-4 rounded-3xl bg-[var(--movi-surface)] px-6 py-[22px]"
          >
            <span
              className="mt-2 size-3.5 shrink-0 rounded-full"
              style={{ background: cur.color }}
            />
            <div>
              <div
                className={cn(
                  landingDisplay,
                  "text-2xl leading-[1.2]",
                )}
              >
                Movi para {cur.forText}
              </div>
              <p className="mt-1.5 text-base leading-normal text-[var(--movi-muted)]">
                {cur.description}
              </p>
            </div>
          </div>

          <div
            data-hero-copy
            className="mt-9 flex flex-wrap items-center gap-7"
          >
            <LandingTrialCta />
            <LandingTextLink href="#produto">Ver como funciona</LandingTextLink>
          </div>
          <p
            data-hero-copy
            className="mt-3.5 text-[15px] text-[var(--movi-muted-2)]"
          >
            Comece o teste de {TRIAL_DAYS} dias. Depois, escolha o plano da sua
            clínica.
          </p>
        </div>

        <div
          data-hero-stage
          className="relative h-[min(640px,70dvh)] min-h-[420px] overflow-hidden rounded-[56px_56px_56px_96px] max-md:mx-auto max-md:w-full max-md:max-w-lg"
          style={{ background: cur.tint, transition: "background 0.35s" }}
        >
          <div
            data-hero-float
            className="absolute top-8 left-6 z-10 flex max-w-[230px] items-center gap-2.5 rounded-[22px] bg-[var(--movi-surface)] py-3 pr-[18px] pl-3.5 text-base leading-snug font-extrabold text-[var(--movi-ink)] sm:top-10 sm:left-8"
          >
            <span
              className="size-3 shrink-0 rounded-full"
              style={{ background: cur.color }}
            />
            <span>{cur.anam}</span>
          </div>

          <div
            data-hero-float
            data-hero-mascot
            className="absolute top-5 right-6 z-10 w-[120px] sm:top-6 sm:right-8 sm:w-[170px]"
          >
            <LandingMascot size={170} className="h-auto w-full" />
          </div>

          <div
            data-hero-float
            className="absolute top-[36%] right-6 left-6 z-10 overflow-hidden rounded-2xl border border-[var(--movi-border)] bg-[var(--movi-surface)] sm:top-[232px] sm:right-8 sm:left-8"
          >
            <Image
              src={LANDING_ASSETS.heroAgenda}
              alt="Agenda da clínica no Movi, com sessões coloridas por status"
              width={720}
              height={400}
              className="h-auto w-full"
              priority
              sizes="(max-width: 1024px) 90vw, 480px"
            />
          </div>

          <div
            data-hero-float
            data-hero-phone
            className="absolute right-6 bottom-6 z-10 h-[200px] w-[110px] overflow-hidden rounded-[32px] border-[7px] border-[var(--movi-band)] bg-[var(--movi-surface)] sm:right-8 sm:bottom-8 sm:h-[290px] sm:w-[164px]"
          >
            <Image
              src={LANDING_ASSETS.dashMobile}
              alt="Dashboard do Movi no celular"
              width={328}
              height={580}
              className="size-full object-cover object-top"
              sizes="164px"
            />
          </div>

          <div
            data-hero-float
            className="absolute bottom-6 left-6 z-10 rounded-[20px] bg-[var(--movi-band)] px-[18px] py-2.5 text-[var(--movi-on-dark)] sm:bottom-8 sm:left-8"
          >
            <div className="text-[15px] leading-snug font-extrabold">
              Evolução registrada
            </div>
            <div className="text-[13px] leading-snug font-semibold text-[var(--movi-on-dark-muted)]">
              com assinatura profissional
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only">
        Período de teste de {TRIAL_DAYS} dias. Entrar em {paths.auth.login}.
      </span>
    </section>
  );
}
