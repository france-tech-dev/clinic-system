import { LandingNav } from "./landing-nav";
import { LandingHero, LandingHeroBackdrop } from "./landing-hero";
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
          id="top"
          aria-labelledby="landing-hero-title"
          className="relative -mt-14 overflow-hidden md:-mt-24"
        >
          <div className="absolute inset-0" aria-hidden>
            <LandingHeroBackdrop />
          </div>
          <div className="relative">
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
