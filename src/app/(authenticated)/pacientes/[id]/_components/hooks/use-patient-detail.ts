"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { deletePatientAction } from "@/features/patient/patient.actions";
import type {
  EvaluationDTO,
  PatientDetailDTO,
} from "@/features/patient/patient.types";
import type { AnamneseSummaryDTO } from "@/features/anamnese/anamnese.types";
import type { GuardianDTO } from "@/features/guardian/guardian.types";
import { buildPatientReportPayload } from "@/features/patient/_lib/pdf/build-patient-report-payload";
import type { PatientReportMode } from "@/features/patient/_lib/pdf/types";
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
import { usePatientEvaluations } from "./use-patient-evaluations";
import { usePatientPdfReport } from "@/features/patient/hooks/use-patient-pdf-report";
import { usePatientSessions } from "./use-patient-sessions";
import { useRoteiroNotes } from "./use-roteiro-notes";

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

  const pdfReport = usePatientPdfReport();
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

  const buildReportPayload = useCallback(
    (reportMode: PatientReportMode, evaluation?: EvaluationDTO) =>
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

  function previewReport(mode: PatientReportMode, evaluation?: EvaluationDTO) {
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
