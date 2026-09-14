import type { Metadata } from "next";
import { LandingPage } from "./_components/landing-page";

export const metadata: Metadata = {
  title: "Movi Clínicas — gestão clínica em um só sistema",
  description:
    "Agenda, prontuário, anamnese, avaliações, caixa e equipe para clínicas multiprofissionais. Teste gratuito de 7 dias.",
};

export default function MarketingHomePage() {
  return <LandingPage />;
}
