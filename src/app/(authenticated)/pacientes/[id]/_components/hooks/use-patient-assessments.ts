"use client";

import { useState } from "react";
import { toast } from "sonner";
import { deleteClinicalEvaluationAction } from "@/domains/patient/patient.actions";
import type {
  ClinicalEvaluationDTO,
  PatientDetailDTO,
} from "@/domains/patient/patient.types";

export function usePatientClinicalEvaluations({
  setDetail,
  pending,
  startTransition,
}: {
  setDetail: React.Dispatch<React.SetStateAction<PatientDetailDTO>>;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [evalOpen, setEvalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState<ClinicalEvaluationDTO | null>(null);
  const [viewEval, setViewEval] = useState<ClinicalEvaluationDTO | null>(null);

  function openNewEvaluation() {
    setEditingEval(null);
    setEvalOpen(true);
  }

  function openEditEvaluation(ev: ClinicalEvaluationDTO) {
    setViewEval(null);
    setEditingEval(ev);
    setEvalOpen(true);
  }

  function saveEvaluation(ev: ClinicalEvaluationDTO, isEdit: boolean) {
    setDetail((d) => ({
      ...d,
      clinicalEvaluations: isEdit
        ? d.clinicalEvaluations.map((e) => (e.id === ev.id ? ev : e))
        : [ev, ...d.clinicalEvaluations],
    }));
    setEvalOpen(false);
  }

  function deleteClinicalEvaluation(id: string) {
    startTransition(async () => {
      const result = await deleteClinicalEvaluationAction({ id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setDetail((d) => ({
        ...d,
        clinicalEvaluations: d.clinicalEvaluations.filter((e) => e.id !== id),
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
    deleteClinicalEvaluation,
    pending,
    startTransition,
  };
}
