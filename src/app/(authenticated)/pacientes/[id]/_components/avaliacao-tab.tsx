"use client";

import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import { AvaliacaoLista } from "./avaliacao-lista";

export function AvaliacaoTab({
  patientId,
  assessments,
  onViewEvaluation,
  onNewFicha,
}: {
  patientId: string;
  assessments: AssessmentDTO[];
  onViewEvaluation: (evaluation: AssessmentDTO) => void;
  onNewFicha: () => void;
}) {
  return (
    <section
      role="tabpanel"
      id="patient-tabpanel-avaliacao"
      aria-labelledby="patient-tab-avaliacao"
      className="space-y-3"
    >
      <AvaliacaoLista
        patientId={patientId}
        assessments={assessments}
        onViewEvaluation={onViewEvaluation}
        onNewFicha={onNewFicha}
      />
    </section>
  );
}
