"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  assignExerciseAction,
  removePlanItemAction,
} from "@/features/patient/patient.actions";
import type { PatientDetailDTO } from "@/features/patient/patient.types";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";

export function usePatientPlan({
  detail,
  setDetail,
  exercises,
  pending,
  startTransition,
}: {
  detail: PatientDetailDTO;
  setDetail: React.Dispatch<React.SetStateAction<PatientDetailDTO>>;
  exercises: ExerciseDTO[];
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCat, setAssignCat] = useState<string | null>(null);

  const assignedIds = useMemo(
    () => new Set(detail.planItems.map((p) => p.exerciseId)),
    [detail.planItems],
  );

  const assignList = useMemo(() => {
    const q = assignSearch.trim().toLowerCase();
    return exercises.filter((e) => {
      const matchCat = !assignCat || e.categoryId === assignCat;
      const matchQ = !q || e.title.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [assignSearch, assignCat, exercises]);

  function assign(exerciseId: string) {
    startTransition(async () => {
      const result = await assignExerciseAction({
        patientId: detail.patient.id,
        exerciseId,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({
        ...d,
        planItems: [
          result.data,
          ...d.planItems.filter((p) => p.id !== result.data.id),
        ],
      }));
      toast.success("Atividade atribuída");
    });
  }

  function removePlan(id: string) {
    startTransition(async () => {
      const result = await removePlanItemAction({ id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({
        ...d,
        planItems: d.planItems.filter((p) => p.id !== id),
      }));
    });
  }

  return {
    assignOpen,
    setAssignOpen,
    assignSearch,
    setAssignSearch,
    assignCat,
    setAssignCat,
    assignedIds,
    assignList,
    assign,
    removePlan,
    pending,
  };
}
