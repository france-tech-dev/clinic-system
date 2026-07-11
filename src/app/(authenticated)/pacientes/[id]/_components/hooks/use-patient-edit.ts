"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updatePatientAction } from "@/features/patient/patient.actions";
import type { PatientDetailDTO } from "@/features/patient/patient.types";

export function usePatientEdit({
  detail,
  setDetail,
  pending,
  startTransition,
}: {
  detail: PatientDetailDTO;
  setDetail: React.Dispatch<React.SetStateAction<PatientDetailDTO>>;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [editName, setEditName] = useState(detail.patient.name);
  const [editNotes, setEditNotes] = useState(detail.patient.notes);

  function openEditPatient() {
    setEditName(detail.patient.name);
    setEditNotes(detail.patient.notes);
    setEditPatientOpen(true);
  }

  function savePatientEdit() {
    startTransition(async () => {
      const result = await updatePatientAction({
        id: detail.patient.id,
        name: editName,
        notes: editNotes,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setDetail((d) => ({ ...d, patient: { ...d.patient, ...result.data } }));
      setEditPatientOpen(false);
      toast.success("Paciente atualizado");
    });
  }

  return {
    editPatientOpen,
    setEditPatientOpen,
    editName,
    setEditName,
    editNotes,
    setEditNotes,
    openEditPatient,
    savePatientEdit,
    pending,
  };
}
