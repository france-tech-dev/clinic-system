import Link from "next/link";
import { paths } from "@/shared/constants/paths";
import { LandingBrandLockup } from "../_components/landing-brand-mark";
import { landingContainer, landingDisplay } from "../_components/landing-ui";

export const metadata = {
  title: "Política de privacidade — Movi Clínicas",
};

export default function PrivacidadePage() {
  return (
    <main className={landingContainer + " py-12 md:py-16"}>
      <Link href={paths.root} className="inline-block">
        <LandingBrandLockup mascotSize={40} wordmarkSize={72} />
      </Link>
      <h1
        className={`${landingDisplay} mt-10 text-3xl text-[var(--movi-ink)] md:text-4xl`}
      >
        Política de privacidade
      </h1>
      <p className="mt-2 text-sm text-[var(--movi-muted)]">
        Última atualização: 16 de outubro de 2026
      </p>
      <div className="prose prose-neutral mt-8 max-w-2xl text-[var(--movi-ink)]">
        <p>
          Esta Política descreve, de forma resumida (LGPD-light), como a Movi
          Clínicas trata dados pessoais no contexto do Serviço.
        </p>
        <h2>1. Papéis</h2>
        <p>
          A clínica (organização) é a controladora dos dados de pacientes,
          responsáveis e equipe. A Movi processa esses dados sob instrução da
          clínica para prestar o Serviço (operadora).
        </p>
        <h2>2. Dados tratados</h2>
        <p>
          Podemos processar dados de conta (nome, e-mail), dados de equipe,
          dados cadastrais de pacientes/responsáveis e registros clínicos
          inseridos pelos profissionais, além de logs técnicos necessários à
          segurança e ao funcionamento.
        </p>
        <h2>3. Finalidades</h2>
        <p>
          Prestação do Serviço, autenticação, faturamento da assinatura,
          suporte, segurança e cumprimento de obrigações legais.
        </p>
        <h2>4. Compartilhamento</h2>
        <p>
          Dados podem ser processados por provedores de infraestrutura
          (hospedagem, e-mail, pagamentos) sob contratos e medidas adequadas.
          Não vendemos dados pessoais.
        </p>
        <h2>5. Direitos e retenção</h2>
        <p>
          Titulares podem exercer direitos previstos na LGPD perante a clínica
          controladora. A Movi apoia a clínica na atendimento quando o pedido
          envolver dados processados na plataforma. Dados são retidos enquanto
          a conta estiver ativa e pelos prazos legais aplicáveis.
        </p>
        <h2>6. Contato</h2>
        <p>
          Para solicitações de privacidade relacionadas ao Serviço, contacte a
          clínica responsável ou o suporte da Movi indicado na plataforma.
        </p>
      </div>
      <p className="mt-10 text-sm">
        <Link href={paths.legal.termos} className="underline underline-offset-4">
          Termos de uso
        </Link>
        {" · "}
        <Link href={paths.root} className="underline underline-offset-4">
          Voltar ao início
        </Link>
      </p>
    </main>
  );
}
