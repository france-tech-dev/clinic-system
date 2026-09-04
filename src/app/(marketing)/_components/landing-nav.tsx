"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/templates/ThemeSwitcher/ThemeSwitcher";
import { paths } from "@/shared/constants/paths";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";
import { cn } from "@/shared/lib/utils";

const NAV_LINKS = [
  { href: "#produto", label: "Produto" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#planos", label: "Planos" },
] as const;

const MIN_WIDTH = 640;
const MAX_SCROLL = 1000;

function HeaderLogo({
  size = 36,
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

export function LandingNav() {
  const navRef = useRef<HTMLElement>(null);
  const [activeHref, setActiveHref] = useState("#produto");

  const updateNav = (scrollY: number) => {
    const nav = navRef.current;
    if (!nav) return;

    if (window.innerWidth < 768) {
      nav.style.width = "100%";
      nav.dataset.scrolling = scrollY > 0 ? "true" : "false";
      return;
    }

    if (scrollY > 0) {
      nav.dataset.scrolling = "true";
      const progress = Math.min(scrollY / MAX_SCROLL, 1);
      const eased = 1 - (1 - progress) ** 4;
      const maxWidth = window.innerWidth * 0.8;
      nav.style.width = `${maxWidth - (maxWidth - MIN_WIDTH) * eased}px`;
    } else {
      nav.dataset.scrolling = "false";
      nav.style.width = "80%";
    }
  };

  useEffect(() => {
    const onScroll = () => updateNav(window.scrollY);
    updateNav(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.href.slice(1)),
    ).filter((el): el is HTMLElement => Boolean(el));

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute("id");
          if (id) setActiveHref(`#${id}`);
        });
      },
      { threshold: 0.35, rootMargin: "-12% 0px -45% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const onNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === "#top") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    const offset = window.innerWidth < 768 ? -72 : -24;
    const top = target.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveHref(href);
  };

  return (
    <>
      <nav
        ref={navRef}
        id="landing-main-nav"
        aria-label="Principal"
        data-scrolling="false"
        style={{ width: "80%" }}
        className={cn(
          "fixed top-0 left-1/2 z-40 -translate-x-1/2 rounded-full border border-transparent",
          "backdrop-blur-xl transition-[background-color,border-color,border-radius,box-shadow] duration-300 ease-in-out md:top-6",
          /* Mobile: faixa full-width no topo */
          "max-md:w-full! max-md:rounded-none max-md:bg-linear-to-b max-md:from-background max-md:from-50% max-md:via-background/90 max-md:to-transparent",
          /* Scroll: pill glass líquido (estilo france-tech + iOS) */
          "data-[scrolling=true]:border-white/20 data-[scrolling=true]:bg-white/40",
          "data-[scrolling=true]:shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.5)]",
          "data-[scrolling=true]:backdrop-blur-[48px] data-[scrolling=true]:backdrop-saturate-200",
          "dark:data-[scrolling=true]:border-white/12 dark:data-[scrolling=true]:bg-white/10",
          "dark:data-[scrolling=true]:shadow-[inset_0_1px_0_0_rgb(255_255_255_/_0.2)]",
          "data-[scrolling=true]:md:rounded-full",
        )}
      >
        <div className="mx-auto flex items-center gap-2 px-3 py-2.5 md:gap-4 md:p-2.5">
          <HeaderLogo size={40} onNavigate={onNavClick} />

          <ul className="flex flex-1 items-center justify-center gap-2 sm:gap-4 md:gap-8">
            {NAV_LINKS.map((link) => {
              const active = activeHref === link.href;

              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(event) => onNavClick(event, link.href)}
                    className={cn(
                      "group relative text-xs transition-colors sm:text-sm",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    aria-current={active ? "true" : undefined}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "absolute top-1/2 -left-3.5 hidden size-1.5 -translate-y-1/2 rounded-full bg-primary transition-all duration-300 md:block",
                        active ? "scale-100 opacity-100" : "scale-0 opacity-0",
                      )}
                    />
                    <span className="max-sm:hidden">{link.label}</span>
                    <span className="sm:hidden">
                      {link.href === "#como-funciona" ? "Como" : link.label}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-1">
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href={paths.auth.login}>Entrar</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={paths.auth.signup}>
                <span className="hidden md:inline">
                  Teste de {TRIAL_DAYS} dias
                </span>
                <span className="md:hidden">Teste</span>
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Reserva espaço do nav fixed */}
      <div className="h-14 md:h-24" aria-hidden />
    </>
  );
}
