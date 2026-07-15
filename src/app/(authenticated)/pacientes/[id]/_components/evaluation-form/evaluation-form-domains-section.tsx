import { Input } from "@/components/ui/input";
import type { EvaluationDomain } from "@/features/patient/patient.types";
import { categoryOf } from "@/shared/constants/evaluation-domains";
import { cn } from "@/shared/lib/utils";

export function EvaluationFormDomainsSection({
  domains,
  onDomainsChange,
}: {
  domains: EvaluationDomain[];
  onDomainsChange: (domains: EvaluationDomain[]) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Exame por domínio — 0 = dependente · 4 = independente
      </p>
      <div className="space-y-2">
        {domains.map((domain, index) => {
          const cat = categoryOf(domain.categoryId);
          return (
            <div
              key={domain.categoryId}
              className="rounded-md border border-border p-2"
            >
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                  <span
                    className="size-2 rounded-full"
                    style={{ background: cat.color }}
                  />
                  {cat.label}
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => {
                        const next = [...domains];
                        next[index] = { ...domain, score };
                        onDomainsChange(next);
                      }}
                      className={cn(
                        "size-7 rounded border text-xs font-medium",
                        domain.score === score
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
              <Input
                placeholder="Observação (opcional)"
                value={domain.note}
                onChange={(e) => {
                  const next = [...domains];
                  next[index] = { ...domain, note: e.target.value };
                  onDomainsChange(next);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
