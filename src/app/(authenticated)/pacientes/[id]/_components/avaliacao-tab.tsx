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
    <section
      role="tabpanel"
      id="patient-tabpanel-avaliacao"
      aria-labelledby="patient-tab-avaliacao"
      className="space-y-3"
    >
      <AvaliacaoLista
        clinicalEvaluations={clinicalEvaluations}
        onNewEvaluation={onNewEvaluation}
        onViewEvaluation={onViewEvaluation}
      />
    </section>
  );
}
