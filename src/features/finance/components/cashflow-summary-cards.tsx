import Link from "next/link";
import { formatBrl } from "@/shared/lib/money-utils";
import type { CashflowSummary } from "@/domains/finance/finance.types";
import type { CashListView } from "@/domains/finance/_lib/cash-list-view";
import { cn } from "@/shared/lib/utils";

function projectedHint(real: number, forecast: number) {
  const projected = real + forecast;
  if (forecast === 0) return null;
  return `de ${formatBrl(projected)} previstos`;
}

type OverviewViewId = Exclude<CashListView, "all">;

export function CashflowSummaryCards({
  summary,
  periodLabel,
  variant = "hero",
  activeView = "all",
  onViewChange,
  viewHref,
}: {
  summary: CashflowSummary;
  periodLabel?: string;
  variant?: "hero" | "equal" | "overview";
  activeView?: CashListView;
  onViewChange?: (view: CashListView) => void;
  /** Dashboard: cada card navega para o caixa com o filtro correspondente. */
  viewHref?: (view: OverviewViewId) => string;
}) {
  const balanceClass =
    summary.balance >= 0 ? "text-foreground" : "text-destructive";
  const projectedBalanceClass =
    summary.projectedBalance >= 0
      ? "text-muted-foreground"
      : "text-destructive/80";

  if (variant === "overview") {
    const items: {
      id: OverviewViewId;
      label: string;
      value: string;
      hint: string | null;
      className: string;
    }[] = [
      {
        id: "income",
        label: "Entradas",
        value: formatBrl(summary.income),
        hint:
          summary.forecastIncome > 0
            ? `Previsto: ${formatBrl(summary.income + summary.forecastIncome)}`
            : null,
        className: "text-primary",
      },
      {
        id: "expense",
        label: "Saídas",
        value: formatBrl(summary.expense),
        hint:
          summary.forecastExpense > 0
            ? `Previsto: ${formatBrl(summary.expense + summary.forecastExpense)}`
            : null,
        className: "text-destructive",
      },
      {
        id: "receber",
        label: "A receber",
        value: formatBrl(summary.forecastIncome),
        hint: "Lançamentos previstos de entrada",
        className: "text-foreground",
      },
      {
        id: "pagar",
        label: "A pagar",
        value: formatBrl(summary.forecastExpense),
        hint: "Lançamentos previstos de saída",
        className: "text-foreground",
      },
    ];

    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {items.map((item) => {
          const active = activeView === item.id;
          const asButton = Boolean(onViewChange);
          const href = viewHref?.(item.id);
          const className = cn(
            "rounded-xl border bg-card p-4 text-left transition-colors",
            active
              ? "border-primary ring-1 ring-primary/30"
              : "border-border",
            (asButton || href) && !active && "hover:bg-muted/40",
            (asButton || href) &&
              "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          );

          const body = (
            <>
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {item.label}
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl font-semibold tabular-nums",
                  item.className,
                )}
              >
                {item.value}
              </p>
              {item.hint ? (
                <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
              ) : null}
            </>
          );

          if (asButton) {
            return (
              <button
                key={item.id}
                type="button"
                className={className}
                aria-pressed={active}
                onClick={() => onViewChange?.(active ? "all" : item.id)}
              >
                {body}
              </button>
            );
          }

          if (href) {
            return (
              <Link key={item.id} href={href} className={className}>
                {body}
              </Link>
            );
          }

          return (
            <div key={item.id} className={className}>
              {body}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === "equal") {
    const items = [
      {
        label: "Entradas",
        value: formatBrl(summary.income),
        hint: projectedHint(summary.income, summary.forecastIncome),
        className: "text-primary",
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
            <p className={cn("mt-1 text-2xl font-semibold", item.className)}>
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
            "mt-2 text-3xl font-semibold tracking-tight sm:text-4xl",
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
          <p className="mt-1 text-xl font-semibold text-primary">
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
          <p className="mt-1 text-xl font-semibold text-destructive">
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
