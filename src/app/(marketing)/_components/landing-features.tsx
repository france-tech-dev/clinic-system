import {
  IconCalendarEvent,
  IconCash,
  IconChartBar,
  IconClipboardList,
  IconFileDescription,
  IconNotes,
  IconShieldCheck,
  IconUsers,
  IconUserHeart,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

type Feature = {
  title: string;
  subtitle: string;
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
};

const FEATURES: readonly Feature[] = [
  {
    title: "Agenda do dia",
    subtitle: "Turno, confirmações e evoluções pendentes",
    Icon: IconCalendarEvent,
  },
  {
    title: "Pacientes",
    subtitle: "Prontuário e histórico em um só lugar",
    Icon: IconUserHeart,
  },
  {
    title: "PDF clínico",
    subtitle: "Assinatura e registro profissional",
    Icon: IconFileDescription,
  },
  {
    title: "Anamnese",
    subtitle: "Formulários por especialidade",
    Icon: IconNotes,
  },
  {
    title: "Avaliações",
    subtitle: "Instrumentos estruturados, como o GMFM-88, PEDI e Perfil Sensorial",
    Icon: IconClipboardList,
  },
  {
    title: "Caixa",
    subtitle: "Cobranças e fluxo financeiro da clínica",
    Icon: IconCash,
  },
  {
    title: "Dashboard",
    subtitle: "Indicadores para a liderança",
    Icon: IconChartBar,
  },
  {
    title: "Equipe",
    subtitle: "Convites e acesso restrito à sua clínica",
    Icon: IconUsers,
  },
  {
    title: "Planos",
    subtitle: "Funcionalidades comuns; planos por tamanho de equipe",
    Icon: IconShieldCheck,
  },
] as const;

const COMING = [
  "Portal do responsável — em desenvolvimento",
  "Lembretes de consulta por WhatsApp — em desenvolvimento",
] as const;

export function LandingFeatures() {
  return (
    <section
      id="recursos"
      aria-labelledby="landing-features-title"
      className="scroll-mt-24 border-b border-border"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="landing-features-title"
            className="font-serif text-3xl tracking-tight sm:text-4xl lg:text-5xl"
          >
            O essencial da gestão clínica, em um só lugar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Agenda, prontuário, anamnese, avaliações, caixa e equipe no mesmo
            produto — sem depender de múltiplos softwares.
          </p>
        </div>

        <ul className="mt-14 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, subtitle, Icon }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                <Icon aria-hidden className="size-5 text-foreground" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-14 max-w-xl">
          <h3 className="text-center text-sm font-medium text-muted-foreground">
            Em desenvolvimento
          </h3>
          <ul className="mt-3 space-y-2 text-center">
            {COMING.map((item) => (
              <li key={item} className="text-sm text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
