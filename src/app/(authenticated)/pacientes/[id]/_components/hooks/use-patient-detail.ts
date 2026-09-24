"use client";

import type { AnamneseSummaryDTO } from "@/domains/anamnese/anamnese.types";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import type {
  EvolutionDTO,
  LinkableAppointmentDTO,
} from "@/domains/evolution/evolution.types";
import type { GuardianDTO } from "@/domains/guardian/guardian.types";
import { buildPatientReportPayload } from "@/domains/patient/_lib/pdf/build-patient-report-payload";
import type {
  PatientReportMode,
  PatientReportPayload,
} from "@/domains/patient/_lib/pdf/types";
import { deletePatientAction } from "@/domains/patient/patient.actions";
import type { PatientDetailDTO } from "@/domains/patient/patient.types";
import type {
  PrintBranding,
  ProfessionalProfile,
} from "@/domains/settings/settings.types";
import { formatProfessionalSignature } from "@/domains/settings/settings.types";
import { paths } from "@/shared/constants/paths";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import { useRouter } from "next/navigation";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  PATIENT_DETAIL_TAB_IDS,
  type PatientDetailTab,
} from "../patient-detail-types";
import { usePatientAssessments } from "./use-patient-assessments";
import { usePatientEdit } from "./use-patient-edit";
import { usePatientEvolutions } from "./use-patient-evolutions";

const tabParser = parseAsStringEnum([...PATIENT_DETAIL_TAB_IDS]).withDefault(
  "avaliacao",
);

export function usePatientDetail({
  initial,
  initialAssessments,
  initialEvolutions,
  initialAppointments,
  initialGuardians,
  initialAnamneses,
  initialAnamneseSections,
  professional,
  branding,
}: {
  initial: PatientDetailDTO;
  initialAssessments: AssessmentDTO[];
  initialEvolutions: EvolutionDTO[];
  initialAppointments: LinkableAppointmentDTO[];
  initialGuardians: GuardianDTO[];
  initialAnamneses: AnamneseSummaryDTO[];
  initialAnamneseSections: PdfKeyValueSection[];
  professional: ProfessionalProfile;
  branding: PrintBranding;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState(initial);
  const [assessments, setAssessments] = useState(initialAssessments);
  const [evolutions, setEvolutions] = useState(initialEvolutions);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [guardians, setGuardians] = useState(initialGuardians);
  const [anamneses] = useState(initialAnamneses);
  const [tab, setTabState] = useQueryState("tab", tabParser);

  function setTab(next: PatientDetailTab) {
    void setTabState(next);
  }
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
  const patientEdit = usePatientEdit({
    detail,
    setDetail,
    guardians,
    setGuardians,
    pending,
    startTransition,
  });
  const evaluations = usePatientAssessments({
    setAssessments,
    pending,
    startTransition,
  });
  const sessions = usePatientEvolutions({
    setEvolutions,
    setAppointments,
    pending,
    startTransition,
  });

  const signature = formatProfessionalSignature(professional);

  const buildReportPayload = useCallback(
    (reportMode: PatientReportMode, assessment?: AssessmentDTO) =>
      buildPatientReportPayload({
        detail,
        assessments,
        evolutions,
        mode: reportMode,
        branding,
        professional,
        authorProfessional:
          reportMode === "evaluation"
            ? (assessment?.authorProfessional ?? null)
            : null,
        assessment,
        anamneseSections: initialAnamneseSections,
      }),
    [
      assessments,
      branding,
      detail,
      evolutions,
      initialAnamneseSections,
      professional,
    ],
  );

  function previewReport(mode: PatientReportMode, assessment?: AssessmentDTO) {
    pdfReport.openPreview(buildReportPayload(mode, assessment));
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
    assessments,
    evolutions,
    appointments,
    setPatient,
    tab: tab as PatientDetailTab,
    setTab,
    pending,
    professional,
    branding,
    signature,
    pdfReport,
    previewReport,
    anamneses,
    patientEdit,
    evaluations,
    sessions,
    removePatient,
  };
}

export type PatientDetailViewModel = ReturnType<typeof usePatientDetail>;
