"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deletePatientAction } from "@/features/patient/patient.actions";
import type { PatientDetailDTO } from "@/features/patient/patient.types";
import type { ExerciseDTO } from "@/features/exercise/exercise.types";
import type { ProfessionalProfile } from "@/features/settings/settings.types";
import { formatProfessionalSignature } from "@/features/settings/settings.types";
import { paths } from "@/shared/constants/paths";
import { useRouter } from "next/navigation";
import type { PatientDetailTab } from "../patient-detail-types";
import { useAnamneseForm } from "./use-anamnese-form";
import { usePatientEdit } from "./use-patient-edit";
import { usePatientEvaluations } from "./use-patient-evaluations";
import { usePatientPlan } from "./use-patient-plan";
import { usePatientPrint } from "./use-patient-print";
import { usePatientSessions } from "./use-patient-sessions";
import { useRoteiroNotes } from "./use-roteiro-notes";

export function usePatientDetail({
  initial,
  exercises,
  professional,
}: {
  initial: PatientDetailDTO;
  exercises: ExerciseDTO[];
  professional: ProfessionalProfile;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState(initial);
  const [tab, setTab] = useState<PatientDetailTab>("plano");
  const [pending, startTransition] = useTransition();

  const print = usePatientPrint();
  const plan = usePatientPlan({
    detail,
    setDetail,
    exercises,
    pending,
    startTransition,
  });
  const anamnese = useAnamneseForm({
    patientId: detail.patient.id,
    initialData: initial.anamneseData,
    setDetail,
    pending,
    startTransition,
    onRefresh: () => router.refresh(),
  });
  const roteiro = useRoteiroNotes({
    patientId: detail.patient.id,
    initialNotes: initial.roteiroNotes,
    pending,
    startTransition,
  });
  const patientEdit = usePatientEdit({
    detail,
    setDetail,
    pending,
    startTransition,
  });
  const evaluations = usePatientEvaluations({
    detail,
    setDetail,
    pending,
    startTransition,
  });
  const sessions = usePatientSessions({
    setDetail,
    pending,
    startTransition,
  });

  const signature = formatProfessionalSignature(professional);

  function removePatient() {
    if (!confirm(`Remover ${detail.patient.name} e todos os dados associados?`))
      return;
    startTransition(async () => {
      const result = await deletePatientAction({ id: detail.patient.id });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Paciente removido");
      router.push(paths.pacientes);
    });
  }

  return {
    detail,
    tab,
    setTab,
    pending,
    exercises,
    professional,
    signature,
    print,
    plan,
    anamnese,
    roteiro,
    patientEdit,
    evaluations,
    sessions,
    removePatient,
  };
}

export type PatientDetailViewModel = ReturnType<typeof usePatientDetail>;
