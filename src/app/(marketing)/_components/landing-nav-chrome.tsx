"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/templates/ThemeSwitcher/ThemeSwitcher";
import { paths } from "@/shared/constants/paths";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";
import { cn } from "@/shared/lib/utils";
import { LANDING_NAV_LINKS } from "./use-landing-nav-behavior";

type LandingNavChromeProps = {
  activeHref: string;
  onNavClick: (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
};

function HeaderLogo({
  size = 40,
  onNavigate,
}: {
  size?: number;
  onNavigate: (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => void;
}) {
  return (
    <Link
      href={paths.root}
      onClick={(event) => onNavigate(event, "#top")}
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-label="Movi Clinicas — início"
    >
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className="size-full object-contain"
        priority
      />
    </Link>
  );
}

export function LandingNavChrome({
  activeHref,
  onNavClick,
}: LandingNavChromeProps) {
  return (
    <div className="relative z-10 mx-auto flex items-center gap-2 px-3 py-2.5 md:gap-4 md:p-2.5">
      <HeaderLogo onNavigate={onNavClick} />

      <ul className="flex flex-1 items-center justify-center gap-2 sm:gap-4 md:gap-8">
        {LANDING_NAV_LINKS.map((link) => {
          const active = activeHref === link.href;

          return (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={(event) => onNavClick(event, link.href)}
                className={cn(
                  "group relative text-xs transition-colors sm:text-sm",
                  "group-data-[scrolling=false]/nav:text-white/80 group-data-[scrolling=false]/nav:hover:text-white",
                  active
                    ? "group-data-[scrolling=false]/nav:text-white group-data-[scrolling=true]/nav:text-foreground"
                    : "group-data-[scrolling=true]/nav:text-muted-foreground group-data-[scrolling=true]/nav:hover:text-foreground",
                )}
                aria-current={active ? "true" : undefined}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-1/2 -left-3.5 hidden size-1.5 -translate-y-1/2 rounded-full bg-primary transition-all duration-300 md:block",
                    "group-data-[scrolling=false]/nav:bg-white",
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
        <div className="group-data-[scrolling=false]/nav:[&_button]:text-white group-data-[scrolling=false]/nav:[&_button]:hover:bg-white/15">
          <ThemeSwitcher />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="hidden group-data-[scrolling=false]/nav:text-white group-data-[scrolling=false]/nav:hover:bg-white/15 group-data-[scrolling=false]/nav:hover:text-white sm:inline-flex"
          asChild
        >
          <Link href={paths.auth.login}>Entrar</Link>
        </Button>
        <Button
          size="sm"
          className="group-data-[scrolling=false]/nav:border-transparent group-data-[scrolling=false]/nav:bg-white group-data-[scrolling=false]/nav:text-neutral-950 group-data-[scrolling=false]/nav:hover:bg-white/90"
          asChild
        >
          <Link href={paths.auth.signup}>
            <span className="hidden md:inline">
              Teste de {TRIAL_DAYS} dias
            </span>
            <span className="md:hidden">Teste</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
