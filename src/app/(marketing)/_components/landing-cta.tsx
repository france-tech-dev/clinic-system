import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";
import { paths } from "@/shared/constants/paths";

export function LandingCta() {
  return (
    <section
      aria-labelledby="landing-cta-title"
      className="border-b border-border"
    >
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 py-24 sm:px-6 lg:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 size-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_oklch(0.75_0.08_171_/_0.35)_0%,_transparent_68%)] dark:bg-[radial-gradient(circle,_oklch(0.55_0.06_171_/_0.45)_0%,_transparent_68%)]"
        />
        <div className="relative flex aspect-square w-full max-w-md flex-col items-center justify-center rounded-full border border-border/70 bg-background/90 px-8 text-center shadow-sm backdrop-blur-sm dark:bg-card/90">
          <h2
            id="landing-cta-title"
            className="font-serif text-3xl tracking-tight sm:text-4xl"
          >
            Abre o fichário da tua clínica
          </h2>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Cria a organização, convida a equipa e usa a Movi durante{" "}
            {TRIAL_DAYS} dias — sem cartão.
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href={paths.auth.signup}>
              Começar agora
              <IconArrowUpRight data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
