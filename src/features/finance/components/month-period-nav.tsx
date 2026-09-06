"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  currentMonthParam,
  shiftMonthParam,
} from "@/domains/finance/_lib/month-utils";

type MonthPeriodNavProps = {
  month: string;
  monthLabel: string;
  onMonthChange: (month: string) => void;
  pending?: boolean;
  /** Extra controls after the month arrows (ex.: filtro de profissional). */
  trailing?: React.ReactNode;
};

/** Navegação mensal partilhada (caixa / dashboard). */
export function MonthPeriodNav({
  month,
  monthLabel,
  onMonthChange,
  pending = false,
  trailing,
}: MonthPeriodNavProps) {
  const isCurrentMonth = month === currentMonthParam();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => onMonthChange(shiftMonthParam(month, -1))}
          disabled={pending}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <p className="min-w-36 text-center font-serif text-lg font-semibold capitalize">
          {monthLabel}
        </p>
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => onMonthChange(shiftMonthParam(month, 1))}
          disabled={pending}
          aria-label="Próximo mês"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
      {!isCurrentMonth ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => onMonthChange(currentMonthParam())}
        >
          Este mês
        </Button>
      ) : null}
      {trailing}
    </div>
  );
}
