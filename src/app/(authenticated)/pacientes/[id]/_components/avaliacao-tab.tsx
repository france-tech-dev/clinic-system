import type {
  EvaluationDTO,
  RoteiroNoteDTO,
} from "@/features/patient/patient.types";
import {
  ROTEIROS,
  type Roteiro,
  type RoteiroCategory,
  type RoteiroId,
} from "@/shared/constants/roteiros";
import { cn } from "@/shared/lib/utils";
import { AvaliacaoLista } from "./avaliacao-lista";
import { RoteiroSection } from "./roteiro-section";
import type { AvaliacaoView } from "./patient-detail-types";

export function AvaliacaoTab({
  evaluations,
  avaliacaoView,
  roteiroId,
  currentRoteiro,
  currentCategory,
  roteiroDraft,
  currentRoteiroNote,
  pending,
  onAvaliacaoViewChange,
  onOpenRoteiro,
  onNewEvaluation,
  onViewEvaluation,
  onSelectTick,
  onRoteiroDraftChange,
  onSaveRoteiroNote,
  onPreviewRoteiro,
}: {
  evaluations: EvaluationDTO[];
  avaliacaoView: AvaliacaoView;
  roteiroId: RoteiroId;
  currentRoteiro: Roteiro;
  currentCategory: RoteiroCategory;
  roteiroDraft: string;
  currentRoteiroNote: RoteiroNoteDTO | undefined;
  pending: boolean;
  onAvaliacaoViewChange: (view: AvaliacaoView) => void;
  onOpenRoteiro: (id: RoteiroId) => void;
  onNewEvaluation: () => void;
  onViewEvaluation: (evaluation: EvaluationDTO) => void;
  onSelectTick: (tick: string) => void;
  onRoteiroDraftChange: (value: string) => void;
  onSaveRoteiroNote: () => void;
  onPreviewRoteiro: () => void;
}) {
  return (
    <section className="space-y-4">
      <div className="no-print flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAvaliacaoViewChange("lista")}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium",
            avaliacaoView === "lista"
              ? "border-primary bg-primary/10 text-foreground"
              : "text-muted-foreground",
          )}
        >
          Avaliações
        </button>
        {ROTEIROS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onOpenRoteiro(r.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              avaliacaoView === "roteiro" && roteiroId === r.id
                ? "border-primary bg-primary/10 text-foreground"
                : "text-muted-foreground",
            )}
          >
            {r.label}
          </button>
        ))}
      </div>

      {avaliacaoView === "lista" && (
        <AvaliacaoLista
          evaluations={evaluations}
          onNewEvaluation={onNewEvaluation}
          onViewEvaluation={onViewEvaluation}
        />
      )}

      {avaliacaoView === "roteiro" && (
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
      )}
    </section>
  );
}
