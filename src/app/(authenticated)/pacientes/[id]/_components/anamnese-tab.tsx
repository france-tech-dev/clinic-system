import Link from "next/link";
import { Plus } from "lucide-react";
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
    <>
      <div className="no-print flex justify-end">
        <Button asChild size="sm">
          <Link href={paths.anamnese.root}>
            <Plus className="size-4" />
            Nova anamnese
          </Link>
        </Button>
      </div>

      {anamneses.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma anamnese registrada.
        </p>
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
                    Actualizada em {formatDateBR(item.updatedAt.slice(0, 10))}
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
    </>
  );
}
