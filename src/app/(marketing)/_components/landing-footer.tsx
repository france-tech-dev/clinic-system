import Link from "next/link";
import { paths } from "@/shared/constants/paths";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { href: "#produto", label: "Visão geral" },
      { href: "#como-funciona", label: "Como funciona" },
      { href: "#recursos", label: "Recursos" },
      { href: "#planos", label: "Planos" },
    ],
  },
  {
    title: "Conta",
    links: [
      { href: paths.auth.login, label: "Entrar" },
      { href: paths.auth.signup, label: "Criar conta" },
      { href: "#faq", label: "Dúvidas" },
    ],
  },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-zinc-950 text-zinc-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-serif text-xl">Movi Clinicas</p>
          <p className="mt-3 max-w-sm text-sm text-zinc-400">
            Gestão clínica para clínicas de terapia ocupacional e equipes
            multi-profissionais — com dados isolados por organização.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-2.5 text-sm text-zinc-400">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  {link.href.startsWith("#") ? (
                    <a href={link.href} className="hover:text-zinc-100">
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="hover:text-zinc-100">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-zinc-500 sm:px-6">
          © {new Date().getFullYear()} Movi Clinicas. Portal do responsável e
          lembretes por WhatsApp estão em evolução e ainda não devem ser
          tratados como recursos prontos. Valores públicos sujeitos à
          confirmação no checkout.
        </p>
      </div>
    </footer>
  );
}
