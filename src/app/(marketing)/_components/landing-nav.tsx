"use client";

import { cn } from "@/shared/lib/utils";
import { LandingNavChrome } from "./landing-nav-chrome";
import { useLandingNavBehavior } from "./use-landing-nav-behavior";

const SHELL =
  "group/nav fixed top-0 left-1/2 z-40 -translate-x-1/2 overflow-hidden rounded-full border border-transparent transition-[background-color,border-color,border-radius,box-shadow,backdrop-filter] duration-300 ease-in-out md:top-6 max-md:w-full! max-md:rounded-none";

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
          "backdrop-blur-xl data-[scrolling=false]:border-white/15 data-[scrolling=false]:bg-white/10",
          "data-[scrolling=true]:border-white/10 data-[scrolling=true]:bg-card/75",
          "data-[scrolling=true]:md:rounded-full",
        )}
      >
        <LandingNavChrome activeHref={activeHref} onNavClick={onNavClick} />
      </nav>

      <div className="h-14 md:h-24" aria-hidden />
    </>
  );
}
