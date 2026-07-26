import type { EvaluationDTO } from "@/features/patient/patient.types";
import { AvaliacaoLista } from "./avaliacao-lista";

export function AvaliacaoTab({
  evaluations,
  onNewEvaluation,
  onViewEvaluation,
}: {
  evaluations: EvaluationDTO[];
  onNewEvaluation: () => void;
  onViewEvaluation: (evaluation: EvaluationDTO) => void;
}) {
  return (
    <section className="space-y-4">
      <AvaliacaoLista
        evaluations={evaluations}
        onNewEvaluation={onNewEvaluation}
        onViewEvaluation={onViewEvaluation}
      />
    </section>
  );
}
