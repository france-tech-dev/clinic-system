import type { ClinicalEvaluationDTO } from "@/features/patient/patient.types";
import { AvaliacaoLista } from "./avaliacao-lista";

export function AvaliacaoTab({
  clinicalEvaluations,
  onNewEvaluation,
  onViewEvaluation,
}: {
  clinicalEvaluations: ClinicalEvaluationDTO[];
  onNewEvaluation: () => void;
  onViewEvaluation: (evaluation: ClinicalEvaluationDTO) => void;
}) {
  return (
    <section className="space-y-4">
      <AvaliacaoLista
        clinicalEvaluations={clinicalEvaluations}
        onNewEvaluation={onNewEvaluation}
        onViewEvaluation={onViewEvaluation}
      />
    </section>
  );
}
