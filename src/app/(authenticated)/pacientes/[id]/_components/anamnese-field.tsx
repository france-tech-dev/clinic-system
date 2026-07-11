import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
                  onChange={(e) =>
                    onChange({ ...data, [key]: e.target.value })
                  }
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
                <select
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  value={rowVal}
                  onChange={(e) =>
                    onChange({ ...data, [key]: e.target.value })
                  }
                >
                  <option value="">—</option>
                  {(field.options ?? []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
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
            return (
              <label
                key={opt}
                className="flex items-center gap-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selected, opt]
                      : selected.filter((s) => s !== opt);
                    onChange({ ...data, [field.id]: next.join("|") });
                  }}
                />
                {opt}
              </label>
            );
          })}
        </div>
      ) : field.type === "radio" && field.options ? (
        <div className="flex flex-wrap gap-3">
          {field.options.map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm">
              <input
                type="radio"
                name={field.id}
                checked={value === opt}
                onChange={() => onChange({ ...data, [field.id]: opt })}
              />
              {opt}
            </label>
          ))}
        </div>
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
