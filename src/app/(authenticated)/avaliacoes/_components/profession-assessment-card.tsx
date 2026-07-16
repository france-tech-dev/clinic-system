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
import type { ProfessionAssessmentCatalogItem } from "@/features/protocol/assessments";
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

export function ProfessionAssessmentCard({
  item,
}: {
  item: ProfessionAssessmentCatalogItem;
}) {
  const Icon = PROFESSION_ICONS[item.professionId];
  const hasAssessments = item.assessments.length > 0;

  return (
    <Card
      className={
        hasAssessments
          ? "transition-shadow hover:shadow-md"
          : "opacity-80"
      }
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
              <CardTitle className="font-serif text-lg">{item.label}</CardTitle>
              <Badge variant="outline">{item.council}</Badge>
            </div>
            <CardDescription className="mt-1">
              {hasAssessments
                ? item.assessments.length === 1
                  ? "1 avaliação disponível"
                  : `${item.assessments.length} avaliações disponíveis`
                : "Avaliações em breve"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-(--card-spacing)">
        {hasAssessments ? (
          <ul className="flex flex-col gap-2">
            {item.assessments.map((assessment) => (
              <li key={assessment.id}>
                <Link
                  href={assessment.href}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-3 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground group-hover:text-primary">
                      {assessment.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {assessment.description}
                    </p>
                  </div>
                  <ChevronRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Ainda não há avaliações cadastradas para esta profissão.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
