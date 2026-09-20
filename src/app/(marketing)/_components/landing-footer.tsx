import Link from "next/link";
import { paths } from "@/shared/constants/paths";
import { cn } from "@/shared/lib/utils";
import { LandingBrandLockup } from "./landing-brand-mark";
import { landingContainer, landingDisplay } from "./landing-ui";

const PRODUCT_LINKS = [
  { href: "#produto", label: "Como funciona" },
  { href: "#recursos", label: "Recursos" },
  { href: "#planos", label: "Planos" },
] as const;

const ACCOUNT_LINKS = [
  { href: paths.auth.login, label: "Entrar" },
  { href: paths.auth.signup, label: "Criar conta" },
  { href: "#faq", label: "Dúvidas" },
] as const;

export function LandingFooter() {
  return (
    <footer className="bg-[var(--movi-band)] pt-16 pb-12 md:pt-20 md:pb-12">
      <div className={landingContainer}>
        <div className="grid gap-12 md:grid-cols-12 md:gap-6 md:items-start">
          <div className="md:col-span-5">
            <LandingBrandLockup
              onDark
              mascotSize={54}
              wordmarkSize={96}
            />
            <p className="mt-[22px] max-w-[400px] text-base text-[var(--movi-on-dark-muted)]">
              Sistema de saúde integrado para clínicas de várias especialidades,
              com dados isolados por organização.
            </p>
          </div>

          <div className="md:col-span-2 md:col-start-8">
            <h3
              className={cn(
                landingDisplay,
                "text-lg text-[var(--movi-on-dark)]",
              )}
            >
              Produto
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-base text-[var(--movi-on-dark-muted)]">
              {PRODUCT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="hover:text-[var(--movi-on-dark)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--movi-sun)]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 md:col-start-10">
            <h3
              className={cn(
                landingDisplay,
                "text-lg text-[var(--movi-on-dark)]",
              )}
            >
              Conta
            </h3>
            <div className="mt-4 flex flex-col gap-2.5 text-base text-[var(--movi-on-dark-muted)]">
              {ACCOUNT_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="hover:text-[var(--movi-on-dark)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--movi-sun)]"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-16 border-t border-[rgb(244_239_230/0.25)] pt-6 text-sm text-[var(--movi-on-dark-muted)]">
          © 2026 Movi Clínicas. O portal do responsável e os lembretes por
          WhatsApp estão em desenvolvimento e ainda não são recursos concluídos.
        </p>
      </div>
    </footer>
  );
}
