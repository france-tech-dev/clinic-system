"use client";

import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { categoryOf } from "@/shared/constants/evaluation-domains";
import { cn } from "@/shared/lib/utils";
import type { EvaluationDialogValues } from "./evaluation-form-types";

export function EvaluationFormDomainsSection() {
  const { control } = useFormContext<EvaluationDialogValues>();
  const domains = useWatch({ control, name: "domains" }) ?? [];

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
                <FormField
                  control={control}
                  name={`domains.${index}.score`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((score) => (
                          <button
                            key={score}
                            type="button"
                            onClick={() => field.onChange(score)}
                            className={cn(
                              "size-7 rounded border text-xs font-medium",
                              field.value === score
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground hover:bg-muted",
                            )}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name={`domains.${index}.note`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Observação (opcional)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
