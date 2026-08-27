"use client";

import * as React from "react";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
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

/** Interpreta `yyyy-MM-dd` como data civil local (nunca via `new Date(iso)`). */
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

export type DatePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /**
   * Dropdown de mês/ano para datas distantes (ex.: aniversário).
   * Sem isto, usa navegação por setas — adequado a datas clínicas próximas.
   */
  longRange?: boolean;
  fromYear?: number;
  toYear?: number;
  "aria-invalid"?: boolean;
};

export function DatePicker({
  value = "",
  onChange,
  id,
  placeholder = "Selecionar data",
  disabled,
  className,
  longRange = false,
  fromYear = 1920,
  toYear,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = value ? parseIsoDate(value) : undefined;
  const endYear = toYear ?? new Date().getFullYear();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          data-empty={!selected}
          className={cn(
            "w-full justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon data-icon="inline-start" />
          {selected ? formatDateBR(toIsoDate(selected)) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ptBR}
          selected={selected}
          defaultMonth={selected}
          captionLayout={longRange ? "dropdown" : "label"}
          startMonth={longRange ? new Date(fromYear, 0) : undefined}
          endMonth={longRange ? new Date(endYear, 11) : undefined}
          onSelect={(date) => {
            if (!date) return;
            onChange?.(toIsoDate(date));
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
