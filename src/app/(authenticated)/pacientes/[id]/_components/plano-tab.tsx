import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PlanItemDTO } from "@/features/patient/patient.types";
import { categoryOf } from "@/shared/constants/exercise-categories";

export function PlanoTab({
  planItems,
  onAssignOpen,
  onRemovePlan,
}: {
  planItems: PlanItemDTO[];
  onAssignOpen: () => void;
  onRemovePlan: (id: string) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="no-print flex justify-end">
        <Button size="sm" onClick={onAssignOpen}>
          <Plus className="size-4" />
          Atribuir atividade
        </Button>
      </div>
      {planItems.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhuma atividade no plano.
        </p>
      ) : (
        <ul className="space-y-2">
          {planItems.map((item) => {
            const cat = categoryOf(item.categoryId);
            return (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border bg-card px-3 py-3"
              >
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: cat.color }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {cat.label}
                    </span>
                  </div>
                  <p className="font-medium">{item.exerciseTitle}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.objective}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="no-print"
                  onClick={() => onRemovePlan(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
