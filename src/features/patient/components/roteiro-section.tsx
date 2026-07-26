import { FileText } from "lucide-react";
import { ClinicalWorkspaceShell } from "@/components/clinical-workspace-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RoteiroNoteDTO } from "@/features/patient/patient.types";
import type { Roteiro, RoteiroCategory } from "@/shared/constants/roteiros";

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
  onPreviewReport?: () => void;
}) {
  return (
    <ClinicalWorkspaceShell
      navLabel="Categorias do roteiro"
      items={currentRoteiro.categories.map((cat) => ({
        id: cat.tick,
        label: cat.tick,
      }))}
      activeId={currentCategory.tick}
      onSelect={onSelectTick}
      footer={
        <>
          <Button disabled={pending} onClick={onSave}>
            Salvar notas
          </Button>
          {onPreviewReport ? (
            <Button variant="outline" onClick={onPreviewReport}>
              <FileText className="size-4" />
              Relatório PDF
            </Button>
          ) : null}
        </>
      }
    >
      <div>
        <h3 className="font-serif text-lg font-semibold">
          {currentCategory.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground italic">
          {currentCategory.context}
        </p>
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-border md:block">
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

      <ul className="flex flex-col gap-2 md:hidden">
        {currentCategory.rows.map((row) => (
          <li
            key={row[0]}
            className="rounded-md border border-border bg-card p-3"
          >
            <p className="font-medium">{row[0]}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground uppercase">
              O que observar
            </p>
            <p className="text-sm text-muted-foreground">{row[1]}</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground uppercase">
              Leitura clínica
            </p>
            <p className="text-sm text-muted-foreground">{row[2]}</p>
          </li>
        ))}
      </ul>

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
    </ClinicalWorkspaceShell>
  );
}
