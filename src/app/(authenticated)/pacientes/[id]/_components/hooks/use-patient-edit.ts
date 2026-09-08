"use client";

import {
  saveGuardianAndEnablePortalAction,
  updatePatientWithGuardianAction,
} from "@/application/patient";
import {
  EMPTY_GUARDIAN_DRAFT,
  guardianDraftToForm,
  guardianDtoToDraft,
  type GuardianFormDraft,
} from "@/domains/guardian/_lib/guardian-form-defaults";
import {
  guardianDraftSchema,
  type GuardianDraftInput,
} from "@/domains/guardian/guardian.schema";
import type { GuardianDTO } from "@/domains/guardian/guardian.types";
import { patientDtoToDraft } from "@/domains/patient/_lib/patient-form-defaults";
import {
  patientDraftSchema,
  type PatientDraftInput,
} from "@/domains/patient/patient.schema";
import type { PatientDetailDTO } from "@/domains/patient/patient.types";
import { DEFAULT_MEMBER_PASSWORD } from "@/shared/constants/auth";
import { applyActionFieldErrors } from "@/shared/lib/apply-action-field-errors";
import { parseBrl } from "@/shared/lib/money-utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { toast } from "sonner";

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
        const result = await updatePatientWithGuardianAction({
          guardian: {
            id: editGuardianId,
            ...guardianDraftToForm(draft),
          },
          patient: {
            id: detail.patient.id,
            name: patientDraft.name,
            birthDate: patientDraft.birthDate || null,
            sex: patientDraft.sex,
            notes: patientDraft.notes,
            pricingType: patientDraft.pricingType,
            price: parseBrl(patientDraft.priceInput),
            guardianId: editGuardianId,
          },
        });
        if (!result.success) {
          applyActionFieldErrors(guardianForm.setError, result.fieldErrors);
          applyActionFieldErrors(patientForm.setError, result.fieldErrors);
          toast.error(result.message);
          return;
        }

        setGuardians((prev) => {
          const others = prev.filter((g) => g.id !== result.data.guardian.id);
          return [...others, result.data.guardian].sort((a, b) =>
            a.name.localeCompare(b.name),
          );
        });
        setDetail((d) => ({
          ...d,
          patient: {
            ...d.patient,
            ...result.data.patient,
            guardian: {
              ...result.data.guardian,
              documentImageUrl: result.data.guardian.documentImageUrl,
            },
          },
        }));
        setHasPortalAccess(result.data.guardian.hasPortalAccess);
        setEditPatientOpen(false);
        toast.success("Paciente atualizado");
      });
    })();
  }

  function enablePortal() {
    void guardianForm.handleSubmit((draft: GuardianFormDraft) => {
      startTransition(async () => {
        const result = await saveGuardianAndEnablePortalAction({
          guardian: {
            id: editGuardianId,
            ...guardianDraftToForm(draft),
          },
          portal: {
            id: editGuardianId,
            password: DEFAULT_MEMBER_PASSWORD,
            confirmPassword: DEFAULT_MEMBER_PASSWORD,
          },
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
