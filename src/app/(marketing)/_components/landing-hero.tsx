import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { paths } from "@/shared/constants/paths";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";

export function LandingHero() {
  return (
    <div className="relative mx-auto flex min-h-[min(100svh,52rem)] max-w-3xl flex-col items-center justify-center px-4 pb-24 pt-20 text-center sm:px-6 lg:pb-32 lg:pt-28">
      <h1
        id="landing-hero-title"
        className="animate-[landing-fade-up_0.7s_ease-out_both] font-serif text-4xl leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        A clínica inteira em um só lugar
      </h1>
      <p className="mx-auto mt-5 max-w-xl animate-[landing-fade-up_0.7s_ease-out_0.06s_both] text-pretty text-base text-white/85 sm:text-lg">
        Agenda, prontuário, anamnese, avaliações, financeiro e equipe — para
        clínicas de terapia ocupacional e equipes multi-profissionais.
      </p>
      <div className="mt-9 flex animate-[landing-fade-up_0.7s_ease-out_0.1s_both] flex-col items-center justify-center gap-3 sm:flex-row">
        <Button
          size="lg"
          className="border-transparent bg-white text-neutral-950 hover:bg-white/90"
          asChild
        >
          <Link href={paths.auth.signup}>
            Começar teste de {TRIAL_DAYS} dias
            <IconArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
          asChild
        >
          <Link href={paths.auth.login}>Já tenho conta</Link>
        </Button>
      </div>
      <p className="mt-4 animate-[landing-fade-up_0.7s_ease-out_0.14s_both] text-xs text-white/70">
        Sem pagamento nos primeiros {TRIAL_DAYS} dias. Depois você escolhe o
        plano.
      </p>
    </div>
  );
}

export function LandingHeroBackdrop() {
  return (
    <>
      <Image
        src="/marketing/clouds.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        unoptimized
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-black/25 via-black/15 to-background"
      />
    </>
  );
}
