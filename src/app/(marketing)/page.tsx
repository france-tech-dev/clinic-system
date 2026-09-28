import type { Metadata } from "next";
import { headers } from "next/headers";
import { paths } from "@/shared/constants/paths";
import { auth } from "@/shared/lib/auth";
import { LandingPage } from "./_components/landing-page";

export const metadata: Metadata = {
  title: "Movi Clínicas — gestão clínica integrada",
  description:
    "Agenda, prontuário, anamnese, avaliações, caixa e equipe para clínicas multiprofissionais. Período de teste gratuito de 7 dias.",
};

export default async function MarketingHomePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <LandingPage
      enterHref={session ? paths.agenda : paths.auth.login}
    />
  );
}
