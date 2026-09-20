"use client";

import { cn } from "@/shared/lib/utils";
import { LandingNavChrome } from "./landing-nav-chrome";
import { useLandingNavBehavior } from "./use-landing-nav-behavior";

const SHELL =
  "group/nav fixed top-0 left-1/2 z-40 -translate-x-1/2 overflow-visible rounded-full border transition-[background-color,border-color,border-radius,box-shadow,backdrop-filter] duration-300 ease-in-out md:top-6 max-md:w-full! max-md:rounded-none max-md:overflow-hidden";

export function LandingNav() {
  const { navRef, activeHref, onNavClick } = useLandingNavBehavior();

  return (
    <>
      <nav
        ref={navRef}
        id="landing-main-nav"
        aria-label="Principal"
        data-scrolling="false"
        style={{ width: "80%" }}
        className={cn(
          SHELL,
          "border-[var(--movi-nav-border)] bg-[var(--movi-nav-shell)] backdrop-blur-xl",
          "data-[scrolling=true]:border-[var(--movi-nav-border-scroll)] data-[scrolling=true]:bg-[var(--movi-nav-shell-scroll)] data-[scrolling=true]:shadow-[var(--movi-nav-shadow)]",
          "data-[scrolling=true]:md:rounded-full",
        )}
      >
        <LandingNavChrome activeHref={activeHref} onNavClick={onNavClick} />
      </nav>

      <div className="h-14 md:h-24" aria-hidden />
    </>
  );
}
