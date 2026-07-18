"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import type { AnamneseField } from "@/features/patient/_lib/anamnese-schema";
import { cn } from "@/shared/lib/utils";

export function AnamneseField({
  field,
  data,
  onChange,
}: {
  field: AnamneseField;
  data: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
}) {
  const value = String(data[field.id] ?? "");
  const wide =
    field.w === "lg" ||
    field.type === "textarea" ||
    field.type === "check" ||
    field.type === "rating-grid" ||
    field.type === "status-table";
  const textareaRows = typeof field.rows === "number" ? field.rows : 3;

  return (
    <div className={cn("grid gap-1.5", wide && "sm:col-span-2")}>
      <Label className="text-xs">{field.label}</Label>
      {field.hint && (
        <p className="text-xs text-muted-foreground">{field.hint}</p>
      )}
      {field.type === "textarea" ? (
        <Textarea
          rows={textareaRows}
          value={value}
          onChange={(e) => onChange({ ...data, [field.id]: e.target.value })}
        />
      ) : field.type === "rating-grid" && field.items ? (
        <div className="space-y-2">
          {field.items.map((item) => {
            const key = `${field.id}::${item}`;
            const itemVal = String(data[key] ?? "");
            return (
              <div
                key={item}
                className="flex items-center justify-between gap-2"
              >
                <span className="text-sm">{item}</span>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  className="w-20"
                  value={itemVal}
                  onChange={(e) => onChange({ ...data, [key]: e.target.value })}
                />
              </div>
            );
          })}
        </div>
      ) : field.type === "status-table" && Array.isArray(field.rows) ? (
        <div className="space-y-2">
          {field.rows.map((row) => {
            const key = `${field.id}::${row}`;
            const rowVal = String(data[key] ?? "");
            return (
              <div
                key={row}
                className="grid gap-1 sm:grid-cols-[1fr_10rem] sm:items-center"
              >
                <span className="text-sm">{row}</span>
                <NativeSelect
                  size="sm"
                  className="w-full text-xs"
                  value={rowVal}
                  onChange={(e) => onChange({ ...data, [key]: e.target.value })}
                >
                  <NativeSelectOption value="">—</NativeSelectOption>
                  {(field.options ?? []).map((opt) => (
                    <NativeSelectOption key={opt} value={opt}>
                      {opt}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
            );
          })}
        </div>
      ) : field.type === "check" && field.options ? (
        <div className="flex flex-wrap gap-3">
          {field.options.map((opt) => {
            const selected = String(data[field.id] ?? "")
              .split("|")
              .filter(Boolean);
            const checked = selected.includes(opt);
            const id = `${field.id}-${opt}`;
            return (
              <div key={opt} className="flex items-center gap-1.5">
                <Checkbox
                  id={id}
                  checked={checked}
                  onCheckedChange={(next) => {
                    const isChecked = next === true;
                    const values = isChecked
                      ? [...selected, opt]
                      : selected.filter((s) => s !== opt);
                    onChange({ ...data, [field.id]: values.join("|") });
                  }}
                />
                <Label htmlFor={id} className="text-sm font-normal">
                  {opt}
                </Label>
              </div>
            );
          })}
        </div>
      ) : field.type === "radio" && field.options ? (
        <RadioGroup
          value={value}
          onValueChange={(next) => onChange({ ...data, [field.id]: next })}
          className="flex flex-wrap gap-3"
        >
          {field.options.map((opt) => {
            const id = `${field.id}-${opt}`;
            return (
              <div key={opt} className="flex items-center gap-1.5">
                <RadioGroupItem value={opt} id={id} />
                <Label htmlFor={id} className="text-sm font-normal">
                  {opt}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      ) : (
        <Input
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange({ ...data, [field.id]: e.target.value })}
        />
      )}
    </div>
  );
}
