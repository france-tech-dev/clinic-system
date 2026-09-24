"use client";

import { deleteAssessmentAction } from "@/domains/assessment/assessment.actions";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import { useState } from "react";
import { toast } from "sonner";

export function usePatientAssessments({
  setAssessments,
  pending,
  startTransition,
}: {
  setAssessments: React.Dispatch<React.SetStateAction<AssessmentDTO[]>>;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [evalOpen, setEvalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<AssessmentDTO | null>(null);
  const [viewEval, setViewEval] = useState<AssessmentDTO | null>(null);

  function openNewEvaluation() {
    setEditingEval(null);
    setEvalOpen(true);
  }

  function openEditEvaluation(ev: AssessmentDTO) {
    setViewEval(null);
    setEditingEval(ev);
    setEvalOpen(true);
  }

  function saveEvaluation(ev: AssessmentDTO, isEdit: boolean) {
    setAssessments((list) =>
      isEdit ? list.map((e) => (e.id === ev.id ? ev : e)) : [ev, ...list],
    );
    setEvalOpen(false);
  }

  function deleteAssessment(id: string) {
    startTransition(async () => {
      const result = await deleteAssessmentAction({ id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setAssessments((list) => list.filter((e) => e.id !== id));
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
    deleteAssessment,
    pending,
    startTransition,
  };
}
