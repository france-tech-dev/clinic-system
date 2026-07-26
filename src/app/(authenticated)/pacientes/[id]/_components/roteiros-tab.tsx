import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RoteiroSection } from "@/features/patient/components/roteiro-section";
import type { RoteiroNoteDTO } from "@/features/patient/patient.types";
import {
  ROTEIROS,
  type Roteiro,
  type RoteiroCategory,
  type RoteiroId,
} from "@/shared/constants/roteiros";

export function RoteirosTab({
  roteiroId,
  currentRoteiro,
  currentCategory,
  roteiroDraft,
  currentRoteiroNote,
  pending,
  onOpenRoteiro,
  onSelectTick,
  onRoteiroDraftChange,
  onSaveRoteiroNote,
  onPreviewRoteiro,
}: {
  roteiroId: RoteiroId;
  currentRoteiro: Roteiro;
  currentCategory: RoteiroCategory;
  roteiroDraft: string;
  currentRoteiroNote: RoteiroNoteDTO | undefined;
  pending: boolean;
  onOpenRoteiro: (id: RoteiroId) => void;
  onSelectTick: (tick: string) => void;
  onRoteiroDraftChange: (value: string) => void;
  onSaveRoteiroNote: () => void;
  onPreviewRoteiro: () => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <p className="text-sm text-muted-foreground">
          Roteiros clínicos de Terapia Ocupacional para observação estruturada.
          Escolha o roteiro e registre notas de caso por categoria.
        </p>
        <ToggleGroup
          type="single"
          variant="outline"
          value={roteiroId}
          onValueChange={(value) => {
            if (value) onOpenRoteiro(value as RoteiroId);
          }}
          className="no-print flex-wrap"
        >
          {ROTEIROS.map((r) => (
            <ToggleGroupItem key={r.id} value={r.id} className="text-xs">
              {r.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <RoteiroSection
        currentRoteiro={currentRoteiro}
        currentCategory={currentCategory}
        roteiroDraft={roteiroDraft}
        onRoteiroDraftChange={onRoteiroDraftChange}
        currentRoteiroNote={currentRoteiroNote}
        pending={pending}
        onSelectTick={onSelectTick}
        onSave={onSaveRoteiroNote}
        onPreviewReport={onPreviewRoteiro}
      />
    </section>
  );
}
