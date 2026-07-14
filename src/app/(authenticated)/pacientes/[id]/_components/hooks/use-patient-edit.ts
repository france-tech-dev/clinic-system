"use client";

import { useState } from "react";
import { toast } from "sonner";
import { updatePatientAction } from "@/features/patient/patient.actions";
import type { PatientDetailDTO, PatientPricingType } from "@/features/patient/patient.types";
import {
  formatPatientPriceInput,
  parsePatientPriceInput,
} from "@/features/patient/_lib/patient-price-input";

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
  const [editPricingType, setEditPricingType] = useState<PatientPricingType>(
    detail.patient.pricingType,
  );
  const [editPriceInput, setEditPriceInput] = useState(
    formatPatientPriceInput(detail.patient.priceCents),
  );

  function openEditPatient() {
    setEditName(detail.patient.name);
    setEditNotes(detail.patient.notes);
    setEditPricingType(detail.patient.pricingType);
    setEditPriceInput(formatPatientPriceInput(detail.patient.priceCents));
    setEditPatientOpen(true);
  }

  function savePatientEdit() {
    const priceCents = parsePatientPriceInput(editPriceInput);
    if (editPriceInput.trim() && priceCents === null) {
      toast.error("Informe um valor válido");
      return;
    }

    startTransition(async () => {
      const result = await updatePatientAction({
        id: detail.patient.id,
        name: editName,
        notes: editNotes,
        pricingType: editPricingType,
        priceCents,
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
    editPricingType,
    setEditPricingType,
    editPriceInput,
    setEditPriceInput,
    openEditPatient,
    savePatientEdit,
    pending,
  };
}
