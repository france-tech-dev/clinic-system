"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CashPeriod, PeriodPreset } from "@/domains/finance/finance.types";
import {
  PERIOD_PRESETS,
  buildCashPeriod,
  resolvePresetBounds,
  shiftCashPeriodMonth,
} from "@/domains/finance/_lib/period-utils";
import { currentMonthParam } from "@/domains/finance/_lib/month-utils";

type CashPeriodFilterProps = {
  period: CashPeriod;
  onPeriodChange: (period: CashPeriod) => void;
  pending?: boolean;
  trailing?: React.ReactNode;
};

export function CashPeriodFilter({
  period,
  onPeriodChange,
  pending = false,
  trailing,
}: CashPeriodFilterProps) {
  const isMonth = period.preset === "month";
  const isCurrentMonth =
    isMonth && period.start.slice(0, 7) === currentMonthParam();

  function applyPreset(preset: PeriodPreset) {
    if (preset === "custom") {
      onPeriodChange(buildCashPeriod("custom", period.start, period.end));
      return;
    }
    const bounds = resolvePresetBounds(preset);
    onPeriodChange(buildCashPeriod(preset, bounds.start, bounds.end));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={period.preset}
        onValueChange={(v) => {
          if (v) applyPreset(v as PeriodPreset);
        }}
        disabled={pending}
      >
        <SelectTrigger className="w-[11.5rem]" aria-label="Período">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_PRESETS.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isMonth ? (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => onPeriodChange(shiftCashPeriodMonth(period, -1))}
            disabled={pending}
            aria-label="Mês anterior"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <p className="min-w-36 text-center font-serif text-lg font-semibold capitalize">
            {period.label}
          </p>
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={() => onPeriodChange(shiftCashPeriodMonth(period, 1))}
            disabled={pending}
            aria-label="Próximo mês"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      ) : period.preset === "custom" ? (
        <DatePickerWithRange
          value={{ from: period.start, to: period.end }}
          onChange={({ from, to }) => {
            onPeriodChange(buildCashPeriod("custom", from, to));
          }}
          disabled={pending}
          placeholder="De — até"
        />
      ) : (
        <p className="min-w-36 font-serif text-lg font-semibold">
          {period.label}
        </p>
      )}

      {isMonth && !isCurrentMonth ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={pending}
          onClick={() => applyPreset("month")}
        >
          Este mês
        </Button>
      ) : null}

      {trailing}
    </div>
  );
}
