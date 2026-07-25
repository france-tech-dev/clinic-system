import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AnamneseSummaryDTO } from "@/features/anamnese/anamnese.types";
import { paths } from "@/shared/constants/paths";
import { formatDateBR } from "@/shared/lib/format-date-br";

export function AnamneseTab({
  patientId,
  anamneses,
}: {
  patientId: string;
  anamneses: AnamneseSummaryDTO[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Anamneses preenchidas deste paciente. Abra um formulário para editar
          ou criar uma nova.
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href={paths.anamnese.root}>
            <FileText className="size-4" />
            Nova anamnese
          </Link>
        </Button>
      </div>

      {anamneses.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="font-serif text-lg font-medium">
            Nenhuma anamnese preenchida
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha a especialidade no hub de Anamnese para começar.
          </p>
          <Button asChild className="mt-4" size="sm">
            <Link href={paths.anamnese.root}>Ir para Anamnese</Link>
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {anamneses.map((item) => (
            <li key={item.id}>
              <Link
                href={`${paths.anamnese.byId(item.formId)}?paciente=${patientId}`}
                className="group flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="min-w-0">
                  <p className="font-medium group-hover:text-primary">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Actualizada em{" "}
                    {formatDateBR(item.updatedAt.slice(0, 10))}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-primary">
                  Abrir
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
