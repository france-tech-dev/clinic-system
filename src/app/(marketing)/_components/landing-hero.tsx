import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { paths } from "@/shared/constants/paths";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";

export function LandingHero() {
  return (
    <div className="relative mx-auto max-w-3xl animate-[landing-fade-up_0.7s_ease-out_both] text-center">
      <h1
        id="landing-hero-title"
        className="font-serif text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
      >
        A clínica inteira num só fichário
      </h1>
      <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
        Agenda, prontuário, anamnese, avaliações, caixa e equipa — para clínicas
        de terapia ocupacional e equipas multi-profissionais.
      </p>
      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button size="lg" asChild>
          <Link href={paths.auth.signup}>
            Começar teste de {TRIAL_DAYS} dias
            <IconArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href={paths.auth.login}>Já tenho conta</Link>
        </Button>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        Sem cartão nos primeiros {TRIAL_DAYS} dias. Depois escolhe o plano.
      </p>
    </div>
  );
}
