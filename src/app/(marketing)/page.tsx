import type { Metadata } from "next";
import { LandingPage } from "./_components/landing-page";

export const metadata: Metadata = {
  title: "Movi Clinicas — gestão clínica em um só lugar",
  description:
    "Agenda, prontuário, anamnese, avaliações, caixa e equipe para clínicas multi-profissionais. Teste gratuito de 7 dias.",
};

export default function MarketingHomePage() {
  return (
    <>
      {/*
        THESIS: A clínica vê o ritmo Origin (prova visual + secções generosas) e começa o teste — dual-theme, sem glow roxo SaaS.
        OWN-WORLD: light fichário creme/teal; dark zinc premium; serif nos títulos; placeholders até haver mockups.
        STORY: tudo-em-um para clínicas TO/multi; trial 7 dias; planos com preço claro; portal/WhatsApp em evolução.
        FIRST VIEWPORT: nav + ThemeSwitcher · headline · CTA teste + Entrar · atmosfera teal suave.
        FORM: Origin rhythm + dual theme (user-pinned; seed superseded by brief).
        FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
      */}
      <LandingPage />
    </>
  );
}
