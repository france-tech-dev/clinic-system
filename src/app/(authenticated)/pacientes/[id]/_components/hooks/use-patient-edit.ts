"use client";

import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
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
import {
  patientDraftSchema,
  type PatientDraftInput,
} from "@/features/patient/patient.schema";
import type { PatientDetailDTO } from "@/features/patient/patient.types";
import { patientDtoToDraft } from "@/features/patient/_lib/patient-form-defaults";
import { parseBrl } from "@/shared/lib/money-utils";
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

  const patientForm = useForm<PatientDraftInput>({
    resolver: zodResolver(patientDraftSchema) as Resolver<PatientDraftInput>,
    defaultValues: patientDtoToDraft(detail.patient),
  });

  const guardianForm = useForm<GuardianDraftInput>({
    resolver: zodResolver(guardianDraftSchema),
    defaultValues: (() => {
      const current = guardians.find((g) => g.id === detail.patient.guardianId);
      return current ? guardianDtoToDraft(current) : EMPTY_GUARDIAN_DRAFT;
    })(),
  });

  const guardianEmail =
    useWatch({
      control: guardianForm.control,
      name: "email",
    }) ?? "";

  function openEditPatient() {
    patientForm.reset(patientDtoToDraft(detail.patient));
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
    void (async () => {
      const patientOk = await patientForm.trigger();
      const guardianOk = await guardianForm.trigger();
      if (!patientOk || !guardianOk) return;

      const patientDraft = patientForm.getValues();
      const draft = guardianForm.getValues();

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
          toast.error(guardianResult.message);
          return;
        }

        const result = await updatePatientAction({
          id: detail.patient.id,
          name: patientDraft.name,
          birthDate: patientDraft.birthDate || null,
          sex: patientDraft.sex,
          notes: patientDraft.notes,
          pricingType: patientDraft.pricingType,
          price: parseBrl(patientDraft.priceInput),
          guardianId: editGuardianId,
        });
        if (!result.success) {
          applyActionFieldErrors(patientForm.setError, result.fieldErrors);
          toast.error(result.message);
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
          toast.error(saveGuardian.message);
          return;
        }

        const result = await enableGuardianPortalAccessAction({
          id: editGuardianId,
          password: DEFAULT_MEMBER_PASSWORD,
          confirmPassword: DEFAULT_MEMBER_PASSWORD,
        });
        if (!result.success) {
          applyActionFieldErrors(guardianForm.setError, result.fieldErrors);
          toast.error(result.message);
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
    patientForm,
    editGuardianId,
    handleGuardianIdChange,
    guardianForm,
    guardianEmail,
    hasPortalAccess,
    guardians,
    openEditPatient,
    savePatientEdit,
    enablePortal,
    pending,
  };
}
