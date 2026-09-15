import {
  IconDatabase,
  IconLock,
  IconShieldLock,
  IconUserCheck,
} from "@tabler/icons-react";

const POINTS = [
  {
    title: "Dados separados por clínica",
    body: "Cada organização acessa exclusivamente as próprias informações, sem compartilhar dados entre clínicas.",
    Icon: IconDatabase,
  },
  {
    title: "Acesso por função",
    body: "O profissional utiliza o fluxo de atendimento; a liderança acompanha dashboard, caixa e equipe.",
    Icon: IconUserCheck,
  },
  {
    title: "Controle da equipe",
    body: "Convites e permissões permanecem no âmbito da sua organização.",
    Icon: IconLock,
  },
  {
    title: "Privacidade e LGPD",
    body: "Projetado com foco em menor exposição de dados e maior controle de acesso.",
    Icon: IconShieldLock,
  },
] as const;

export function LandingSecurity() {
  return (
    <section
      aria-labelledby="landing-security-title"
      className="scroll-mt-24 border-b border-border bg-zinc-950 text-zinc-50"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="landing-security-title"
            className="font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl"
          >
            Dados isolados por clínica, com controle de acesso
          </h2>
          <p className="mt-4 text-zinc-400">
            Cada clínica possui o seu espaço. Privacidade e permissões integram
            o produto — não constituem um complemento opcional.
          </p>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {POINTS.map(({ title, body, Icon }) => (
            <li
              key={title}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <Icon aria-hidden className="size-5 text-zinc-300" />
              <h3 className="mt-4 font-serif text-lg font-semibold tracking-tight">
                {title}
              </h3>
              <p className="mt-2 text-sm text-pretty text-zinc-400">{body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
