"use client";

import * as React from "react";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { cn } from "@/shared/lib/utils";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseIsoDate(iso: string): Date | undefined {
  if (!ISO_DATE_RE.test(iso)) return undefined;
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRangeLabel(range: DateRange | undefined, fallback: string) {
  if (!range?.from) return fallback;
  const from = toIsoDate(range.from);
  if (!range.to) return `${formatDateBR(from)} — …`;
  const to = toIsoDate(range.to);
  if (from === to) return formatDateBR(from);
  return `${formatDateBR(from)} — ${formatDateBR(to)}`;
}

export type DateRangeValue = {
  from: string;
  to: string;
};

type DatePickerWithRangeProps = {
  value?: DateRangeValue | null;
  onChange?: (value: DateRangeValue) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  numberOfMonths?: number;
};

/** Baseado no exemplo shadcn `date-picker-with-range` — controlado com `yyyy-MM-dd`. */
export function DatePickerWithRange({
  value = null,
  onChange,
  id = "date",
  placeholder = "Selecionar período",
  disabled,
  className,
  numberOfMonths = 2,
}: DatePickerWithRangeProps) {
  const committed: DateRange | undefined = value
    ? { from: parseIsoDate(value.from), to: parseIsoDate(value.to) }
    : undefined;
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<DateRange | undefined>();
  /** Evita aplicar no 1.º clique (abre sem range completo para o RDP não “ajustar”). */
  const pickingRef = React.useRef(false);

  function handleOpenChange(next: boolean) {
    if (next) {
      setDate(undefined);
      pickingRef.current = false;
    }
    setOpen(next);
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            data-empty={!committed?.from}
            className={cn(
              "w-full min-w-56 justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            )}
          >
            <CalendarIcon data-icon="inline-start" />
            {formatRangeLabel(open ? date : committed, placeholder)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            locale={ptBR}
            defaultMonth={committed?.from}
            selected={date}
            numberOfMonths={numberOfMonths}
            onSelect={(_range, triggerDate) => {
              if (!pickingRef.current) {
                pickingRef.current = true;
                setDate({ from: triggerDate, to: undefined });
                return;
              }

              const start = date?.from ?? triggerDate;
              const end = triggerDate;
              const from = start.getTime() <= end.getTime() ? start : end;
              const to = start.getTime() <= end.getTime() ? end : start;
              setDate({ from, to });
              onChange?.({
                from: toIsoDate(from),
                to: toIsoDate(to),
              });
              pickingRef.current = false;
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
