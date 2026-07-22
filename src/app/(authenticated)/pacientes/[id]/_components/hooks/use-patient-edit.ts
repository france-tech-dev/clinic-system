"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  enableGuardianPortalAccessAction,
  updateGuardianAction,
} from "@/features/guardian/guardian.actions";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import {
  EMPTY_GUARDIAN_DRAFT,
  guardianDraftToForm,
  guardianDtoToDraft,
  type GuardianFormDraft,
} from "@/features/guardian/_lib/guardian-form-defaults";
import {
  guardianDraftSchema,
  type GuardianDraftInput,
} from "@/features/guardian/guardian.schema";
import { DEFAULT_MEMBER_PASSWORD } from "@/shared/constants/auth";
import { updatePatientAction } from "@/features/patient/patient.actions";
import type {
  PatientDetailDTO,
  PatientPricingType,
  PatientSex,
} from "@/features/patient/patient.types";
import {
  formatPatientPriceInput,
  parsePatientPriceInput,
} from "@/features/patient/_lib/patient-price-input";
import { applyActionFieldErrors } from "@/shared/lib/zod-field-errors";

export function usePatientEdit({
  detail,
  setDetail,
  guardians,
  setGuardians,
  pending,
  startTransition,
}: {
  detail: PatientDetailDTO;
  setDetail: React.Dispatch<React.SetStateAction<PatientDetailDTO>>;
  guardians: GuardianDTO[];
  setGuardians: React.Dispatch<React.SetStateAction<GuardianDTO[]>>;
  pending: boolean;
  startTransition: (fn: () => void) => void;
}) {
  const [editPatientOpen, setEditPatientOpen] = useState(false);
  const [editName, setEditName] = useState(detail.patient.name);
  const [editBirthDate, setEditBirthDate] = useState(
    detail.patient.birthDate ?? "",
  );
  const [editSex, setEditSex] = useState<PatientSex>(detail.patient.sex);
  const [editNotes, setEditNotes] = useState(detail.patient.notes);
  const [editPricingType, setEditPricingType] = useState<PatientPricingType>(
    detail.patient.pricingType,
  );
  const [editPriceInput, setEditPriceInput] = useState(
    formatPatientPriceInput(detail.patient.priceCents),
  );
  const [editGuardianId, setEditGuardianId] = useState(
    detail.patient.guardianId,
  );
  const [hasPortalAccess, setHasPortalAccess] = useState(
    () =>
      guardians.find((g) => g.id === detail.patient.guardianId)
        ?.hasPortalAccess ??
      detail.patient.guardian?.hasPortalAccess ??
      false,
  );

  const guardianForm = useForm<GuardianDraftInput>({
    resolver: zodResolver(guardianDraftSchema),
    defaultValues: (() => {
      const current = guardians.find((g) => g.id === detail.patient.guardianId);
      return current ? guardianDtoToDraft(current) : EMPTY_GUARDIAN_DRAFT;
    })(),
  });

  const guardianEmail = useWatch({
    control: guardianForm.control,
    name: "email",
  }) ?? "";
  const guardianName = useWatch({
    control: guardianForm.control,
    name: "name",
  }) ?? "";

  function openEditPatient() {
    setEditName(detail.patient.name);
    setEditBirthDate(detail.patient.birthDate ?? "");
    setEditSex(detail.patient.sex);
    setEditNotes(detail.patient.notes);
    setEditPricingType(detail.patient.pricingType);
    setEditPriceInput(formatPatientPriceInput(detail.patient.priceCents));
    setEditGuardianId(detail.patient.guardianId);
    const current = guardians.find((g) => g.id === detail.patient.guardianId);
    guardianForm.reset(
      current ? guardianDtoToDraft(current) : EMPTY_GUARDIAN_DRAFT,
    );
    setHasPortalAccess(current?.hasPortalAccess ?? false);
    setEditPatientOpen(true);
  }

  function handleGuardianIdChange(id: string) {
    setEditGuardianId(id);
    const selected = guardians.find((g) => g.id === id);
    if (selected) {
      guardianForm.reset(guardianDtoToDraft(selected));
      setHasPortalAccess(selected.hasPortalAccess);
    }
  }

  function savePatientEdit() {
    const priceCents = parsePatientPriceInput(editPriceInput);
    if (editPriceInput.trim() && priceCents === null) {
      toast.error("Informe um valor válido");
      return;
    }

    void guardianForm.handleSubmit((draft: GuardianFormDraft) => {
      startTransition(async () => {
        const guardianResult = await updateGuardianAction({
          id: editGuardianId,
          ...guardianDraftToForm(draft),
        });
        if (!guardianResult.success) {
          applyActionFieldErrors(
            guardianForm.setError,
            guardianResult.fieldErrors,
          );
          toast.error(guardianResult.error);
          return;
        }

        const result = await updatePatientAction({
          id: detail.patient.id,
          name: editName,
          birthDate: editBirthDate || null,
          sex: editSex,
          notes: editNotes,
          pricingType: editPricingType,
          priceCents,
          guardianId: editGuardianId,
        });
        if (!result.success) {
          toast.error(result.error);
          return;
        }

        setGuardians((prev) => {
          const others = prev.filter((g) => g.id !== guardianResult.data.id);
          return [...others, guardianResult.data].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        });
        setDetail((d) => ({
          ...d,
          patient: {
            ...d.patient,
            ...result.data,
            guardian: {
              ...guardianResult.data,
              documentImageUrl: guardianResult.data.documentImageUrl,
            },
          },
        }));
        setHasPortalAccess(guardianResult.data.hasPortalAccess);
        setEditPatientOpen(false);
        toast.success("Paciente atualizado");
      });
    })();
  }

  function enablePortal() {
    void guardianForm.handleSubmit((draft: GuardianFormDraft) => {
      startTransition(async () => {
        const saveGuardian = await updateGuardianAction({
          id: editGuardianId,
          ...guardianDraftToForm(draft),
        });
        if (!saveGuardian.success) {
          applyActionFieldErrors(
            guardianForm.setError,
            saveGuardian.fieldErrors,
          );
          toast.error(saveGuardian.error);
          return;
        }

        const result = await enableGuardianPortalAccessAction({
          id: editGuardianId,
          password: DEFAULT_MEMBER_PASSWORD,
          confirmPassword: DEFAULT_MEMBER_PASSWORD,
        });
        if (!result.success) {
          applyActionFieldErrors(guardianForm.setError, result.fieldErrors);
          toast.error(result.error);
          return;
        }

        setGuardians((prev) => {
          const others = prev.filter((g) => g.id !== result.data.id);
          return [...others, result.data].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        });
        setHasPortalAccess(true);
        guardianForm.reset(guardianDtoToDraft(result.data));
        toast.success(
          "Acesso ao portal criado. O responsável deve alterar a senha no primeiro login.",
        );
      });
    })();
  }

  return {
    editPatientOpen,
    setEditPatientOpen,
    editName,
    setEditName,
    editBirthDate,
    setEditBirthDate,
    editSex,
    setEditSex,
    editNotes,
    setEditNotes,
    editPricingType,
    setEditPricingType,
    editPriceInput,
    setEditPriceInput,
    editGuardianId,
    handleGuardianIdChange,
    guardianForm,
    guardianName,
    guardianEmail,
    hasPortalAccess,
    guardians,
    openEditPatient,
    savePatientEdit,
    enablePortal,
    pending,
  };
}
