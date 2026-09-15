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
    q: "O que é a Movi Clínicas?",
    a: "É um sistema de gestão para clínicas de terapia ocupacional e equipes multiprofissionais. Reúne agenda, pacientes, prontuário com PDF, anamnese, avaliações, caixa e dashboard em um só produto.",
  },
  {
    q: "O que está incluído?",
    a: "Todas as funcionalidades estão disponíveis em todos os planos: agenda, pacientes, evoluções e PDF com assinatura e registro profissional, anamnese, avaliações, caixa, portal do responsável e interpretação assistida por IA. Os planos diferenciam-se pelo número de profissionais incluídos.",
  },
  {
    q: "Serve para o tamanho da minha clínica?",
    a: "Sim. Solo contempla 1 profissional; Professional, até 3 (indicado para equipes de pequeno porte); Enterprise, até 9, com possibilidade de profissionais adicionais.",
  },
  {
    q: "Como testar antes de assinar?",
    a: `Crie a conta e utilize o período de teste de ${TRIAL_DAYS} dias, sem cartão. Em seguida, selecione o plano no checkout.`,
  },
  {
    q: "Os dados dos pacientes ficam isolados?",
    a: "Sim. Cada clínica acessa exclusivamente os próprios dados. As permissões distinguem quem atende de quem gerencia.",
  },
  {
    q: "Tem inteligência artificial?",
    a: "Sim. A interpretação assistida por IA em protocolos de avaliação está disponível em todos os planos. Lembretes por WhatsApp encontram-se em desenvolvimento e não devem ser considerados recurso concluído.",
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
            Respostas objetivas sobre o produto, o período de teste e a proteção
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
