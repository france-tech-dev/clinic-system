import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ANAMNESE_SCHEMA } from "@/features/patient/_lib/anamnese-schema";
import { AnamneseField } from "./anamnese-field";

export function AnamneseTab({
  data,
  onChange,
  pending,
  onSave,
  onPrint,
}: {
  data: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  pending: boolean;
  onSave: () => void;
  onPrint: () => void;
}) {
  return (
    <section className="space-y-6">
      {ANAMNESE_SCHEMA.map((sec) => (
        <div
          key={sec.id}
          className="rounded-md border border-border bg-card p-4"
        >
          <h3 className="font-serif mb-3 text-lg font-semibold">{sec.title}</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {sec.fields.map((field) => (
              <AnamneseField
                key={field.id}
                field={field}
                data={data}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="no-print flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onPrint}>
          <Printer className="size-4" />
          Imprimir anamnese
        </Button>
        <Button disabled={pending} onClick={onSave}>
          Salvar anamnese
        </Button>
      </div>
    </section>
  );
}
