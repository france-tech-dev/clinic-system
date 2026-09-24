"use client";

import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import { AvaliacaoLista } from "./avaliacao-lista";

export function AvaliacaoTab({
  assessments,
  onNewEvaluation,
  onViewEvaluation,
}: {
  assessments: AssessmentDTO[];
  onNewEvaluation: () => void;
  onViewEvaluation: (evaluation: AssessmentDTO) => void;
}) {
  return (
    <section
      role="tabpanel"
      id="patient-tabpanel-avaliacao"
      aria-labelledby="patient-tab-avaliacao"
      className="space-y-3"
    >
      <AvaliacaoLista
        assessments={assessments}
        onNewEvaluation={onNewEvaluation}
        onViewEvaluation={onViewEvaluation}
      />
    </section>
  );
}
