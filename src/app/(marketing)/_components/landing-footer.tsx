import Link from "next/link";
import { paths } from "@/shared/constants/paths";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-serif text-lg text-foreground">Movi Clinicas</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Gestão clínica multi-tenant para clínicas de terapia ocupacional e
            equipas multi-profissionais.
          </p>
        </div>
        <nav
          aria-label="Rodapé"
          className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground"
        >
          <a href="#produto" className="hover:text-foreground">
            Produto
          </a>
          <a href="#como-funciona" className="hover:text-foreground">
            Como funciona
          </a>
          <a href="#planos" className="hover:text-foreground">
            Planos
          </a>
          <Link href={paths.auth.login} className="hover:text-foreground">
            Entrar
          </Link>
          <Link href={paths.auth.signup} className="hover:text-foreground">
            Criar conta
          </Link>
        </nav>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} Movi Clinicas. Preços públicos sujeitos
          à confirmação no checkout Stripe. Portal do responsável e WhatsApp
          estão em evolução e não devem ser tratados como entregues.
        </p>
      </div>
    </footer>
  );
}
