import { LandingNav } from "./landing-nav";
import { LandingHero } from "./landing-hero";
import { LandingProduto } from "./landing-produto";
import { LandingRecursos } from "./landing-recursos";
import { LandingMobile } from "./landing-mobile";
import { LandingSecurity } from "./landing-security";
import { LandingPlans } from "./landing-plans";
import { LandingFaq } from "./landing-faq";
import { LandingCta } from "./landing-cta";
import { LandingFooter } from "./landing-footer";

export function LandingPage({ enterHref }: { enterHref: string }) {
  return (
    <>
      <LandingNav enterHref={enterHref} />
      <main>
        <LandingHero />
        <LandingProduto />
        <LandingRecursos />
        <LandingMobile />
        <LandingSecurity />
        <LandingPlans />
        <LandingFaq />
        <LandingCta enterHref={enterHref} />
      </main>
      <LandingFooter enterHref={enterHref} />
    </>
  );
}
