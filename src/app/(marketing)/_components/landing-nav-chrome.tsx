"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { paths } from "@/shared/constants/paths";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";
import { cn } from "@/shared/lib/utils";
import { LANDING_ASSETS } from "./landing-assets";
import { LANDING_NAV_LINKS } from "./use-landing-nav-behavior";

type LandingNavChromeProps = {
  activeHref: string;
  onNavClick: (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
};

function HeaderLogo({
  size = 44,
  onNavigate,
}: {
  size?: number;
  onNavigate: (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
}) {
  const height = Math.round(size * (470 / 460));

  return (
    <Link
      href={paths.root}
      onClick={(event) => onNavigate(event, "#topo")}
      className="relative shrink-0"
      style={{ width: size, height }}
      aria-label="Movi Clínicas — início"
    >
      <Image
        src={LANDING_ASSETS.mascot}
        alt=""
        width={size * 2}
        height={height * 2}
        className="size-full object-contain"
        priority
        quality={100}
      />
    </Link>
  );
}

export function LandingNavChrome({
  activeHref,
  onNavClick,
}: LandingNavChromeProps) {
  return (
    <div className="relative z-10 mx-auto flex min-w-0 items-center gap-2 px-3 py-2.5 md:gap-3 md:px-3 md:py-2.5 lg:gap-4">
      <HeaderLogo onNavigate={onNavClick} />

      <ul className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3 md:gap-5 lg:gap-8">
        {LANDING_NAV_LINKS.map((link) => {
          const active = activeHref === link.href;

          return (
            <li key={link.href} className="shrink-0">
              <a
                href={link.href}
                onClick={(event) => onNavClick(event, link.href)}
                className={cn(
                  "group relative whitespace-nowrap text-xs font-bold transition-colors sm:text-sm",
                  active
                    ? "text-[var(--movi-heading)]"
                    : "text-[var(--movi-muted-2)] hover:text-[var(--movi-heading)] hover:underline hover:decoration-2 hover:underline-offset-[6px]",
                )}
                aria-current={active ? "true" : undefined}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1/2 -left-3.5 hidden size-1.5 -translate-y-1/2 rounded-full bg-[var(--movi-sun)] transition-all duration-300 md:block",
                    active ? "scale-100 opacity-100" : "scale-0 opacity-0",
                  )}
                />
                <span className="max-sm:hidden">{link.label}</span>
                <span className="sm:hidden">
                  {link.href === "#recursos"
                    ? "Recursos"
                    : link.href === "#faq"
                      ? "Dúvidas"
                      : link.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="hidden font-bold text-[var(--movi-muted-2)] hover:bg-[var(--movi-hover)] hover:text-[var(--movi-heading)] sm:inline-flex"
          asChild
        >
          <Link href={paths.auth.login}>Entrar</Link>
        </Button>
        <Button
          size="sm"
          className="shrink-0 whitespace-nowrap border-transparent bg-[var(--movi-action)] font-extrabold text-[var(--movi-action-fg)] hover:bg-[var(--movi-action-hover)] hover:text-[var(--movi-action-fg)]"
          asChild
        >
          <Link href={paths.auth.signup}>
            <span className="hidden lg:inline">
              Teste de {TRIAL_DAYS} dias
            </span>
            <span className="lg:hidden">Teste</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
