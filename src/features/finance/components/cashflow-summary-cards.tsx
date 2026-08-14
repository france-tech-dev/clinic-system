import { formatBrl } from "@/shared/lib/money-utils";
import type { CashflowSummary } from "@/features/finance/finance.types";
import { cn } from "@/shared/lib/utils";

export function CashflowSummaryCards({
  summary,
}: {
  summary: CashflowSummary;
}) {
  const items = [
    {
      label: "Entradas",
      value: formatBrl(summary.income),
      className: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Saídas",
      value: formatBrl(summary.expense),
      className: "text-red-600 dark:text-red-400",
    },
    {
      label: "Saldo",
      value: formatBrl(summary.balance),
      className:
        summary.balance >= 0
          ? "text-foreground"
          : "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-md border border-border bg-card p-4"
        >
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {item.label}
          </p>
          <p className={cn("mt-1 font-serif text-2xl font-semibold", item.className)}>
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
