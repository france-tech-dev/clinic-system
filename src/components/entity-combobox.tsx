"use client";

import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
} from "@/components/ui/combobox";
import { cn } from "@/shared/lib/utils";

export type EntityComboboxOption = {
  id: string;
  name: string;
};

export type EntityComboboxProps = {
  options: EntityComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Opção extra no topo (ex.: "Todos", "Nenhum"). */
  extraOption?: EntityComboboxOption;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-invalid"?: boolean;
  "aria-label"?: string;
};

export function EntityCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Selecione…",
  searchPlaceholder = "Pesquisar…",
  emptyText = "Nenhum resultado",
  extraOption,
  disabled,
  className,
  id,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
}: EntityComboboxProps) {
  const items = extraOption ? [extraOption, ...options] : options;
  const selected = items.find((item) => item.id === value) ?? null;

  return (
    <Combobox
      items={items}
      value={selected}
      onValueChange={(item) => {
        onValueChange(item?.id ?? extraOption?.id ?? "");
      }}
      itemToStringLabel={(item) => item.name}
      isItemEqualToValue={(a, b) => a.id === b.id}
    >
      <ComboboxTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            id={id}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-label={ariaLabel}
            className={cn(
              "w-full justify-between",
              !selected && "text-muted-foreground",
              className,
            )}
          >
            <ComboboxValue placeholder={placeholder} />
          </Button>
        }
      />
      <ComboboxContent>
        <ComboboxInput placeholder={searchPlaceholder} showTrigger={false} />
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
