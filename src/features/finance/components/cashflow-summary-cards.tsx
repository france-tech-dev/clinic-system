import { formatBrl } from "@/shared/lib/money-utils";
import type { CashflowSummary } from "@/domains/finance/finance.types";
import { cn } from "@/shared/lib/utils";

export function CashflowSummaryCards({
  summary,
  monthLabel,
  variant = "hero",
}: {
  summary: CashflowSummary;
  monthLabel?: string;
  variant?: "hero" | "equal";
}) {
  const balanceClass =
    summary.balance >= 0 ? "text-foreground" : "text-destructive";

  if (variant === "equal") {
    const items = [
      {
        label: "Entradas",
        value: formatBrl(summary.income),
        className: "text-emerald-700 dark:text-emerald-400",
      },
      {
        label: "Saídas",
        value: formatBrl(summary.expense),
        className: "text-destructive",
      },
      {
        label: "Saldo",
        value: formatBrl(summary.balance),
        className: balanceClass,
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
            <p
              className={cn(
                "mt-1 font-serif text-2xl font-semibold",
                item.className,
              )}
            >
              {item.value}
            </p>
          </div>
        ))}
      </div>
    );
  }

  const saldoLabel = monthLabel
    ? `Saldo do mês · ${monthLabel}`
    : "Saldo do mês";

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-md border border-border bg-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">{saldoLabel}</p>
        <p
          className={cn(
            "mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl",
            balanceClass,
          )}
        >
          {formatBrl(summary.balance)}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Entradas
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-emerald-700 dark:text-emerald-400">
            {formatBrl(summary.income)}
          </p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Saídas
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-destructive">
            {formatBrl(summary.expense)}
          </p>
        </div>
      </div>
    </div>
  );
}
