"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TRIAL_DAYS } from "@/shared/constants/billing-plans";

const FAQ = [
  {
    q: "O que é a Movi Clinicas?",
    a: "É um sistema de gestão para clínicas de terapia ocupacional e equipes multi-profissionais. Reúne agenda, pacientes, prontuário com PDF, anamnese, avaliações, caixa e dashboard em um só produto.",
  },
  {
    q: "O que está incluído?",
    a: "Agenda, pacientes, evoluções e PDF com assinatura e CREFITO. Nos planos Pro e Enterprise entram anamnese e caixa; no Enterprise, avaliações estruturadas e recursos avançados do plano. Portal do responsável e WhatsApp ainda estão em evolução.",
  },
  {
    q: "Serve para o tamanho da minha clínica?",
    a: "Sim. Starter, Pro e Enterprise mudam o número de profissionais e os recursos incluídos — escolha o que faz sentido para a sua equipe.",
  },
  {
    q: "Como testar antes de assinar?",
    a: `Crie a conta e use o teste de ${TRIAL_DAYS} dias sem cartão. Depois escolha o plano no checkout.`,
  },
  {
    q: "Os dados dos pacientes ficam isolados?",
    a: "Sim. Cada clínica só acessa os próprios dados. As permissões separam quem atende de quem gerencia.",
  },
  {
    q: "Tem inteligência artificial?",
    a: "No plano Enterprise há interpretação assistida por IA em protocolos de avaliação. Lembretes por WhatsApp ainda estão em evolução — não tratamos como recurso pronto.",
  },
] as const;

export function LandingFaq() {
  return (
    <section
      id="faq"
      aria-labelledby="landing-faq-title"
      className="scroll-mt-24 border-b border-border bg-muted/25"
    >
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="text-center">
          <h2
            id="landing-faq-title"
            className="font-serif text-3xl tracking-tight sm:text-4xl"
          >
            Dúvidas frequentes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Respostas diretas sobre o produto, o período de teste e a proteção
            dos dados.
          </p>
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card px-4 sm:px-6">
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, index) => (
              <AccordionItem key={item.q} value={`item-${index}`}>
                <AccordionTrigger className="py-4 text-base hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>{item.a}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
