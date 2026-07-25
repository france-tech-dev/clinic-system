import Link from "next/link";
import {
  Activity,
  Apple,
  Brain,
  ChevronRight,
  Dumbbell,
  Ear,
  Hand,
  HeartPulse,
  Smile,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HealthProfessionId } from "@/shared/constants/professions";

const PROFESSION_ICONS: Record<HealthProfessionId, LucideIcon> = {
  medico: Stethoscope,
  psicologo: Brain,
  fisioterapeuta: Activity,
  terapeuta_ocupacional: Hand,
  fonoaudiologo: Ear,
  nutricionista: Apple,
  enfermeiro: HeartPulse,
  dentista: Smile,
  educador_fisico: Dumbbell,
};

export type ProfessionCatalogLink = {
  id: string;
  name: string;
  description: string;
  href: string;
};

export type ProfessionCatalogCardLabels = {
  /** Ex.: "avaliação" / "anamnese" */
  singular: string;
  /** Ex.: "avaliações" / "anamneses" */
  plural: string;
  /** Mensagem quando a lista está vazia. */
  emptyDetail: string;
};

export function ProfessionCatalogCard({
  professionId,
  label,
  council,
  items,
  labels,
}: {
  professionId: HealthProfessionId;
  label: string;
  council: string;
  items: ProfessionCatalogLink[];
  labels: ProfessionCatalogCardLabels;
}) {
  const Icon = PROFESSION_ICONS[professionId];
  const hasItems = items.length > 0;
  const countLabel =
    items.length === 1
      ? `1 ${labels.singular} disponível`
      : `${items.length} ${labels.plural} disponíveis`;

  return (
    <Card
      className={hasItems ? "transition-shadow hover:shadow-md" : "opacity-80"}
    >
      <CardHeader className="border-b">
        <div className="flex items-start gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="font-serif text-lg">{label}</CardTitle>
              <Badge variant="outline">{council}</Badge>
            </div>
            <CardDescription className="mt-1">
              {hasItems
                ? countLabel
                : `${labels.plural.charAt(0).toUpperCase()}${labels.plural.slice(1)} em breve`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-(--card-spacing)">
        {hasItems ? (
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground group-hover:text-primary">
                      {item.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">{labels.emptyDetail}</p>
        )}
      </CardContent>
    </Card>
  );
}
