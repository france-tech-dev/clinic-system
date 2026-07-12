import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RoteiroNoteDTO } from "@/features/patient/patient.types";
import type { Roteiro, RoteiroCategory } from "@/shared/constants/roteiros";
import { cn } from "@/shared/lib/utils";

export function RoteiroSection({
  currentRoteiro,
  currentCategory,
  roteiroDraft,
  onRoteiroDraftChange,
  currentRoteiroNote,
  pending,
  onSelectTick,
  onSave,
  onPreviewReport,
}: {
  currentRoteiro: Roteiro;
  currentCategory: RoteiroCategory;
  roteiroDraft: string;
  onRoteiroDraftChange: (value: string) => void;
  currentRoteiroNote: RoteiroNoteDTO | undefined;
  pending: boolean;
  onSelectTick: (tick: string) => void;
  onSave: () => void;
  onPreviewReport: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1">
        {currentRoteiro.categories.map((cat, idx) => (
          <button
            key={cat.tick}
            type="button"
            onClick={() => onSelectTick(cat.tick)}
            className={cn(
              "shrink-0 rounded-md border px-2.5 py-1.5 text-left",
              cat.tick === currentCategory.tick
                ? "border-primary bg-primary/10"
                : "border-border text-muted-foreground",
            )}
          >
            <span className="block font-mono text-[0.625rem] tracking-wide">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="text-xs font-medium">{cat.tick}</span>
          </button>
        ))}
      </div>

      <div>
        <h3 className="font-serif text-lg font-semibold">
          {currentCategory.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground italic">
          {currentCategory.context}
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium">O que observar</th>
              <th className="px-3 py-2 font-medium">Leitura clínica</th>
            </tr>
          </thead>
          <tbody>
            {currentCategory.rows.map((row) => (
              <tr
                key={row[0]}
                className="border-b border-border last:border-0"
              >
                <td className="px-3 py-2 align-top font-medium">{row[0]}</td>
                <td className="px-3 py-2 align-top text-muted-foreground">
                  {row[1]}
                </td>
                <td className="px-3 py-2 align-top text-muted-foreground">
                  {row[2]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-1.5">
        <Label>Notas de caso — {currentCategory.title}</Label>
        <Textarea
          rows={4}
          value={roteiroDraft}
          onChange={(e) => onRoteiroDraftChange(e.target.value)}
          placeholder="Padrões observados nesta criança, cruzando itens de diferentes categorias…"
        />
        {currentRoteiroNote && (
          <p className="text-xs text-muted-foreground">
            Última atualização:{" "}
            {new Date(currentRoteiroNote.updatedAt).toLocaleString("pt-BR")}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} onClick={onSave}>
          Salvar notas
        </Button>
        <Button variant="outline" onClick={onPreviewReport}>
          <FileText className="size-4" />
          Relatório PDF
        </Button>
      </div>
    </div>
  );
}
