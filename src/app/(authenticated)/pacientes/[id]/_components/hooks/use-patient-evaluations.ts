"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteEvaluationAction } from "@/features/patient/patient.actions";
import type {
  EvaluationDTO,
  PatientDetailDTO,
} from "@/features/patient/patient.types";

export function usePatientEvaluations({
  setDetail,
  pending,
  startTransition,
}: {
  setDetail: React.Dispatch<React.SetStateAction<PatientDetailDTO>>;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [evalOpen, setEvalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<EvaluationDTO | null>(null);
  const [viewEval, setViewEval] = useState<EvaluationDTO | null>(null);

  function openNewEvaluation() {
    setEditingEval(null);
    setEvalOpen(true);
  }

  function openEditEvaluation(ev: EvaluationDTO) {
    setViewEval(null);
    setEditingEval(ev);
    setEvalOpen(true);
  }

  function saveEvaluation(ev: EvaluationDTO, isEdit: boolean) {
    setDetail((d) => ({
      ...d,
      evaluations: isEdit
        ? d.evaluations.map((e) => (e.id === ev.id ? ev : e))
        : [ev, ...d.evaluations],
    }));
    setEvalOpen(false);
  }

  function deleteEvaluation(id: string) {
    startTransition(async () => {
      const result = await deleteEvaluationAction({ id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({
        ...d,
        evaluations: d.evaluations.filter((e) => e.id !== id),
      }));
      setViewEval(null);
      toast.success("Avaliação removida");
    });
  }

  return {
    evalOpen,
    setEvalOpen,
    editingEval,
    viewEval,
    setViewEval,
    openNewEvaluation,
    openEditEvaluation,
    saveEvaluation,
    deleteEvaluation,
    pending,
    startTransition,
  };
}
