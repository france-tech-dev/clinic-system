"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveAnamneseAction } from "@/features/patient/patient.actions";
import type { PatientDetailDTO } from "@/features/patient/patient.types";

export function useAnamneseForm({
  patientId,
  initialData,
  setDetail,
  pending,
  startTransition,
  onRefresh,
}: {
  patientId: string;
  initialData: Record<string, unknown>;
  setDetail: React.Dispatch<React.SetStateAction<PatientDetailDTO>>;
  pending: boolean;
  startTransition: (fn: () => void) => void;
  onRefresh: () => void;
}) {
  const [anamneseData, setAnamneseData] = useState(initialData);

  function saveAnamnese() {
    startTransition(async () => {
      const result = await saveAnamneseAction({
        patientId,
        data: anamneseData,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({ ...d, anamneseData }));
      toast.success("Anamnese salva");
      onRefresh();
    });
  }

  return {
    anamneseData,
    setAnamneseData,
    saveAnamnese,
    pending,
  };
}
