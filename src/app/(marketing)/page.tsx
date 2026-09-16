import type { Metadata } from "next";
import { LandingPage } from "./_components/landing-page";

export const metadata: Metadata = {
  title: "Movi Clínicas — gestão clínica integrada",
  description:
    "Agenda, prontuário, anamnese, avaliações, caixa e equipe para clínicas multiprofissionais. Período de teste gratuito de 7 dias.",
};

export default function MarketingHomePage() {
  return <LandingPage />;
}
