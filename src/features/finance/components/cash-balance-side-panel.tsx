import type { ReactNode } from "react";
import { formatBrl } from "@/shared/lib/money-utils";
import type { CashflowSummary } from "@/domains/finance/finance.types";
import { cn } from "@/shared/lib/utils";

/** Painel lateral do overview de caixa — saldo + previstos (sem contas bancárias). */
export function CashBalanceSidePanel({
  summary,
  periodLabel,
  action,
  children,
}: {
  summary: CashflowSummary;
  periodLabel: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  const balanceClass =
    summary.balance >= 0 ? "text-foreground" : "text-destructive";
  const projectedClass =
    summary.projectedBalance >= 0
      ? "text-muted-foreground"
      : "text-destructive/80";

  return (
    <aside className="flex h-full min-w-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <header>
        <h2 className="text-sm font-medium tracking-tight">Saldo do período</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{periodLabel}</p>
      </header>

      <div>
        <p
          className={cn(
            "text-3xl font-semibold tracking-tight tabular-nums",
            balanceClass,
          )}
        >
          {formatBrl(summary.balance)}
        </p>
        {summary.forecastIncome > 0 || summary.forecastExpense > 0 ? (
          <p className={cn("mt-1 text-sm", projectedClass)}>
            Projetado {formatBrl(summary.projectedBalance)}
          </p>
        ) : null}
      </div>

      <ul className="space-y-3 border-t border-border pt-4 text-sm">
        <li className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">Entradas</span>
          <span className="font-medium tabular-nums text-primary">
            {formatBrl(summary.income)}
          </span>
        </li>
        <li className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">Saídas</span>
          <span className="font-medium tabular-nums text-destructive">
            {formatBrl(summary.expense)}
          </span>
        </li>
        <li className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">A receber</span>
          <span className="font-medium tabular-nums">
            {formatBrl(summary.forecastIncome)}
          </span>
        </li>
        <li className="flex items-baseline justify-between gap-3">
          <span className="text-muted-foreground">A pagar</span>
          <span className="font-medium tabular-nums">
            {formatBrl(summary.forecastExpense)}
          </span>
        </li>
      </ul>

      {children ? (
        <div className="border-t border-border pt-4">{children}</div>
      ) : null}

      {action ? <div className="mt-auto pt-1">{action}</div> : null}
    </aside>
  );
}
