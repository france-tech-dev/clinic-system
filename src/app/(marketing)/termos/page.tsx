import Link from "next/link";
import { paths } from "@/shared/constants/paths";
import { LandingBrandLockup } from "../_components/landing-brand-mark";
import { landingContainer, landingDisplay } from "../_components/landing-ui";

export const metadata = {
  title: "Termos de uso — Movi Clínicas",
};

export default function TermosPage() {
  return (
    <main className={landingContainer + " py-12 md:py-16"}>
      <Link href={paths.root} className="inline-block">
        <LandingBrandLockup mascotSize={40} wordmarkSize={72} />
      </Link>
      <h1
        className={`${landingDisplay} mt-10 text-3xl text-[var(--movi-ink)] md:text-4xl`}
      >
        Termos de uso
      </h1>
      <p className="mt-2 text-sm text-[var(--movi-muted)]">
        Última atualização: 16 de outubro de 2026
      </p>
      <div className="prose prose-neutral mt-8 max-w-2xl text-[var(--movi-ink)]">
        <p>
          Estes Termos regem o uso da plataforma Movi Clínicas (“Serviço”) por
          clínicas, profissionais e demais usuários autorizados.
        </p>
        <h2>1. Conta e organização</h2>
        <p>
          Você é responsável por manter credenciais seguras e por garantir que
          apenas pessoas autorizadas acessem a organização. Dados clínicos
          pertencem à clínica (controladora); a Movi atua como operadora
          tecnológica.
        </p>
        <h2>2. Uso adequado</h2>
        <p>
          O Serviço deve ser usado para gestão clínica e administrativa lícita.
          É proibido tentar acessar dados de outras organizações, contornar
          controles de acesso ou usar o Serviço para fins ilícitos.
        </p>
        <h2>3. Disponibilidade e alterações</h2>
        <p>
          Podemos atualizar funcionalidades e estes Termos. Mudanças relevantes
          serão comunicadas no produto ou por e-mail quando possível. O uso
          contínuo após a publicação implica aceitação.
        </p>
        <h2>4. Limitação</h2>
        <p>
          O Serviço é oferecido “como disponível”. Em nenhuma hipótese a Movi se
          responsabiliza por decisões clínicas tomadas com base nas informações
          registradas na plataforma.
        </p>
        <h2>5. Contato</h2>
        <p>
          Dúvidas sobre estes Termos: use o canal de suporte indicado na
          plataforma ou no site.
        </p>
      </div>
      <p className="mt-10 text-sm">
        <Link
          href={paths.legal.privacidade}
          className="underline underline-offset-4"
        >
          Política de privacidade
        </Link>
        {" · "}
        <Link href={paths.root} className="underline underline-offset-4">
          Voltar ao início
        </Link>
      </p>
    </main>
  );
}
