import { LandingNav } from "./landing-nav";
import { LandingHero } from "./landing-hero";
import { LandingShowcase } from "./landing-showcase";
import { LandingTrack } from "./landing-track";
import { LandingDual } from "./landing-dual";
import { LandingCapabilities } from "./landing-capabilities";
import { LandingPlans } from "./landing-plans";
import { LandingCta } from "./landing-cta";
import { LandingFooter } from "./landing-footer";

export function LandingPage() {
  return (
    <>
      <LandingNav />
      <main>
        <section
          aria-labelledby="landing-hero-title"
          className="relative overflow-hidden border-b border-border"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_oklch(0.92_0.04_171)_0%,_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_oklch(0.28_0.04_171)_0%,_transparent_55%)]"
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:pb-24 lg:pt-10">
            <LandingHero />
          </div>
        </section>

        <LandingShowcase />
        <LandingTrack />
        <LandingDual />
        <LandingCapabilities />
        <LandingPlans />
        <LandingCta />
      </main>
      <LandingFooter />
    </>
  );
}
