"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { deletePatientAction } from "@/features/patient/patient.actions";
import type {
  ClinicalEvaluationDTO,
  PatientDetailDTO,
} from "@/features/patient/patient.types";
import type { AnamneseSummaryDTO } from "@/features/anamnese/anamnese.types";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import { buildPatientReportPayload } from "@/features/patient/_lib/pdf/build-patient-report-payload";
import type {
  PatientReportMode,
  PatientReportPayload,
} from "@/features/patient/_lib/pdf/types";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/features/settings/settings.types";
import { formatProfessionalSignature } from "@/features/settings/settings.types";
import { paths } from "@/shared/constants/paths";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import { useRouter } from "next/navigation";
import type { PatientDetailTab } from "../patient-detail-types";
import { usePatientEdit } from "./use-patient-edit";
import { usePatientClinicalEvaluations } from "./use-patient-clinical-evaluations";
import { useRoteiroNotes } from "@/features/patient/hooks/use-roteiro-notes";
import { usePatientSessions } from "./use-patient-sessions";

export function usePatientDetail({
  initial,
  initialGuardians,
  initialAnamneses,
  initialAnamneseSections,
  professional,
  branding,
}: {
  initial: PatientDetailDTO;
  initialGuardians: GuardianDTO[];
  initialAnamneses: AnamneseSummaryDTO[];
  initialAnamneseSections: PdfKeyValueSection[];
  professional: ProfessionalProfile;
  branding: PrintBranding;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState(initial);
  const [guardians, setGuardians] = useState(initialGuardians);
  const [anamneses] = useState(initialAnamneses);
  const [tab, setTab] = useState<PatientDetailTab>("avaliacao");
  const [pending, startTransition] = useTransition();
  const [previewPayload, setPreviewPayload] =
    useState<PatientReportPayload | null>(null);

  function setPatient(patient: PatientDetailDTO["patient"]) {
    setDetail((prev) => ({ ...prev, patient }));
  }

  const pdfReport = {
    previewPayload,
    openPreview: (payload: PatientReportPayload) => setPreviewPayload(payload),
    closePreview: () => setPreviewPayload(null),
  };
  const roteiro = useRoteiroNotes({
    patientId: detail.patient.id,
    initialNotes: initial.roteiroNotes,
    pending,
    startTransition,
  });
  const patientEdit = usePatientEdit({
    detail,
    setDetail,
    guardians,
    setGuardians,
    pending,
    startTransition,
  });
  const evaluations = usePatientClinicalEvaluations({
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

  const buildReportPayload = useCallback(
    (reportMode: PatientReportMode, evaluation?: ClinicalEvaluationDTO) =>
      buildPatientReportPayload({
        detail,
        mode: reportMode,
        branding,
        professional,
        authorProfessional:
          reportMode === "evaluation"
            ? (evaluation?.authorProfessional ?? null)
            : null,
        evaluation,
        roteiro:
          reportMode === "roteiro"
            ? {
                roteiroId: roteiro.roteiroId,
                categoryTick: roteiro.currentCategory.tick,
              }
            : null,
        anamneseSections: initialAnamneseSections,
      }),
    [
      branding,
      detail,
      initialAnamneseSections,
      professional,
      roteiro.currentCategory.tick,
      roteiro.roteiroId,
    ],
  );

  function previewReport(
    mode: PatientReportMode,
    evaluation?: ClinicalEvaluationDTO,
  ) {
    if (mode === "roteiro") {
      pdfReport.openPreview({
        ...buildReportPayload(mode, evaluation),
        roteiro: {
          label: roteiro.currentRoteiro.label,
          category: roteiro.currentCategory,
          notes:
            roteiro.roteiroDraft.trim() ||
            roteiro.currentRoteiroNote?.notes ||
            "",
        },
      });
      return;
    }
    pdfReport.openPreview(buildReportPayload(mode, evaluation));
  }

  function removePatient() {
    startTransition(async () => {
      const result = await deletePatientAction({ id: detail.patient.id });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("Paciente removido");
      router.push(paths.pacientes);
    });
  }

  return {
    detail,
    setPatient,
    tab,
    setTab,
    pending,
    professional,
    branding,
    signature,
    pdfReport,
    previewReport,
    anamneses,
    roteiro,
    patientEdit,
    evaluations,
    sessions,
    removePatient,
  };
}

export type PatientDetailViewModel = ReturnType<typeof usePatientDetail>;
