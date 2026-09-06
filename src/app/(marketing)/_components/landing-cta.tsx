import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";
import { paths } from "@/shared/constants/paths";
import { MediaPlaceholder } from "./media-placeholder";

export function LandingCta() {
  return (
    <section
      aria-labelledby="landing-cta-title"
      className="relative isolate overflow-hidden border-b border-border"
    >
      <Image
        src="/marketing/flower.webp"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-black/45 via-black/35 to-black/55"
      />

      <div className="relative mx-auto flex min-h-[min(90svh,44rem)] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:py-32">
        <h2
          id="landing-cta-title"
          className="font-serif text-4xl tracking-tight text-white sm:text-5xl"
        >
          Leve a Movi para a sua clínica
        </h2>
        <p className="mt-4 max-w-md text-base text-white/85">
          Crie a organização, convide a equipe e use a Movi durante {TRIAL_DAYS}{" "}
          dias.
        </p>
        <Button
          size="lg"
          className="mt-8 border-transparent bg-white text-neutral-950 hover:bg-white/90"
          asChild
        >
          <Link href={paths.auth.signup}>
            Começar agora
            <IconArrowUpRight data-icon="inline-end" />
          </Link>
        </Button>

        <div className="mt-14 w-full max-w-xs">
          <MediaPlaceholder
            label="Mockup do app · imagem a adicionar"
            aspectClassName="aspect-[9/16] max-h-72"
            className="rounded-[2rem] border-white/25 bg-black/25 text-white/70 backdrop-blur-sm"
          />
        </div>
      </div>
    </section>
  );
}
