import type { Metadata } from "next";
import { LandingPage } from "./_components/landing-page";

export const metadata: Metadata = {
  title: "Movi Clinicas — gestão clínica em um só lugar",
  description:
    "Agenda, prontuário, anamnese, avaliações, caixa e equipe para clínicas multi-profissionais. Teste gratuito de 7 dias.",
};

export default function MarketingHomePage() {
  return <LandingPage />;
}
