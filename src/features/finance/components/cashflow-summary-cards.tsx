import { formatBrl } from "@/shared/lib/money-utils";
import type { CashflowSummary } from "@/domains/finance/finance.types";
import { cn } from "@/shared/lib/utils";

function projectedHint(real: number, forecast: number) {
  const projected = real + forecast;
  if (forecast === 0) return null;
  return `de ${formatBrl(projected)} previstos`;
}

export function CashflowSummaryCards({
  summary,
  periodLabel,
  variant = "hero",
}: {
  summary: CashflowSummary;
  periodLabel?: string;
  variant?: "hero" | "equal";
}) {
  const balanceClass =
    summary.balance >= 0 ? "text-foreground" : "text-destructive";
  const projectedBalanceClass =
    summary.projectedBalance >= 0
      ? "text-muted-foreground"
      : "text-destructive/80";

  if (variant === "equal") {
    const items = [
      {
        label: "Entradas",
        value: formatBrl(summary.income),
        hint: projectedHint(summary.income, summary.forecastIncome),
        className: "text-emerald-700 dark:text-emerald-400",
      },
      {
        label: "Saídas",
        value: formatBrl(summary.expense),
        hint: projectedHint(summary.expense, summary.forecastExpense),
        className: "text-destructive",
      },
      {
        label: "Saldo",
        value: formatBrl(summary.balance),
        hint:
          summary.forecastIncome > 0 || summary.forecastExpense > 0
            ? `de ${formatBrl(summary.projectedBalance)} previstos`
            : null,
        className: balanceClass,
      },
    ];

    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-card p-4"
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
            {item.hint ? (
              <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  const saldoLabel = periodLabel
    ? `Saldo do período · ${periodLabel}`
    : "Saldo do período";
  const balanceHint =
    summary.forecastIncome > 0 || summary.forecastExpense > 0
      ? `de ${formatBrl(summary.projectedBalance)} previstos`
      : null;

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <p className="text-sm text-muted-foreground">{saldoLabel}</p>
        <p
          className={cn(
            "mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl",
            balanceClass,
          )}
        >
          {formatBrl(summary.balance)}
        </p>
        {balanceHint ? (
          <p className={cn("mt-1 text-sm", projectedBalanceClass)}>
            {balanceHint}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Entradas
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-emerald-700 dark:text-emerald-400">
            {formatBrl(summary.income)}
          </p>
          {projectedHint(summary.income, summary.forecastIncome) ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {projectedHint(summary.income, summary.forecastIncome)}
            </p>
          ) : null}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Saídas
          </p>
          <p className="mt-1 font-serif text-xl font-semibold text-destructive">
            {formatBrl(summary.expense)}
          </p>
          {projectedHint(summary.expense, summary.forecastExpense) ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {projectedHint(summary.expense, summary.forecastExpense)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
