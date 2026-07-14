"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { usePatientPdfReport } from "@/features/patient/hooks/use-patient-pdf-report";
import { getPatientDetailAction } from "@/features/patient/patient.actions";
import { buildPatientReportPayload } from "@/features/patient/_lib/pdf/build-patient-report-payload";
import {
  buildDefaultEvaluationReportOptions,
  hasEvaluationReportContent,
  type EvaluationReportOptions,
} from "@/features/patient/_lib/pdf/evaluation-report-options";
import { getPatientReportTitle } from "@/features/patient/_lib/pdf/report-meta";
import type { PatientReportMode } from "@/features/patient/_lib/pdf/types";
import type { EvaluationDTO, PatientDTO } from "@/features/patient/patient.types";
import type { PrintBranding, ProfessionalProfile } from "@/features/settings/settings.types";
import {
  ROTEIROS,
  roteiroById,
  type RoteiroId,
} from "@/shared/constants/roteiros";

export type RelatorioFormInput = {
  patients: PatientDTO[];
  professional: ProfessionalProfile;
  branding: PrintBranding;
  initialPatientId: string | null;
  initialEvaluations: EvaluationDTO[];
  initialEvaluationId: string;
};

export function useRelatorioForm({
  patients,
  professional,
  branding,
  initialPatientId,
  initialEvaluations,
  initialEvaluationId,
}: RelatorioFormInput) {
  const pdfReport = usePatientPdfReport();
  const [search, setSearch] = useState("");
  const [patientId, setPatientId] = useState(initialPatientId ?? "");
  const [mode, setMode] = useState<PatientReportMode>("full");
  const [evaluationId, setEvaluationId] = useState(initialEvaluationId);
  const [roteiroId, setRoteiroId] = useState<RoteiroId>("si");
  const [roteiroTick, setRoteiroTick] = useState(ROTEIROS[0].categories[0].tick);
  const [evaluations, setEvaluations] = useState<EvaluationDTO[]>(initialEvaluations);
  const [evaluationReportOptions, setEvaluationReportOptions] =
    useState<EvaluationReportOptions>(() =>
      buildDefaultEvaluationReportOptions(
        initialEvaluations.find((ev) => ev.id === initialEvaluationId) ??
          initialEvaluations[0],
      ),
    );
  const [pending, startTransition] = useTransition();

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = patients.filter((p) => p.status !== "alta");
    if (!q) return list;
    return list.filter((p) => p.name.toLowerCase().includes(q));
  }, [patients, search]);

  const selectedPatient = patients.find((p) => p.id === patientId) ?? null;
  const selectedEvaluation =
    evaluations.find((ev) => ev.id === evaluationId) ?? null;
  const currentRoteiro = roteiroById(roteiroId);

  function loadPatientEvaluations(id: string) {
    if (!id) {
      setEvaluationId("");
      setEvaluations([]);
      setEvaluationReportOptions(buildDefaultEvaluationReportOptions());
      return;
    }

    startTransition(async () => {
      const result = await getPatientDetailAction(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      const nextEvaluations = result.data.evaluations;
      const nextEvaluationId = nextEvaluations[0]?.id ?? "";
      setEvaluations(nextEvaluations);
      setEvaluationId(nextEvaluationId);
      setEvaluationReportOptions(
        buildDefaultEvaluationReportOptions(
          nextEvaluations.find((ev) => ev.id === nextEvaluationId) ??
            nextEvaluations[0],
        ),
      );
    });
  }

  function handlePatientChange(id: string) {
    setPatientId(id);
    loadPatientEvaluations(id);
  }

  function handleEvaluationChange(id: string) {
    setEvaluationId(id);
    const evaluation = evaluations.find((ev) => ev.id === id);
    if (evaluation) {
      setEvaluationReportOptions(buildDefaultEvaluationReportOptions(evaluation));
    }
  }

  function handleModeChange(next: PatientReportMode) {
    setMode(next);
    if (next !== "evaluation") setEvaluationId("");
  }

  function handleRoteiroChange(id: RoteiroId) {
    const roteiro = roteiroById(id);
    setRoteiroId(id);
    setRoteiroTick(roteiro.categories[0].tick);
  }

  function previewReport() {
    if (!patientId) {
      toast.error("Selecione um paciente");
      return;
    }

    startTransition(async () => {
      const result = await getPatientDetailAction(patientId);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const detail = result.data;

      if (mode === "evaluation" && detail.evaluations.length === 0) {
        toast.error("Este paciente não possui avaliações registradas");
        return;
      }

      if (
        mode === "evaluation" &&
        !hasEvaluationReportContent(evaluationReportOptions)
      ) {
        toast.error("Selecione ao menos uma seção ou domínio para o relatório");
        return;
      }

      const evaluation =
        mode === "evaluation"
          ? detail.evaluations.find((ev) => ev.id === evaluationId) ??
            detail.evaluations[0]
          : null;

      const payload = buildPatientReportPayload({
        detail,
        mode,
        branding,
        professional,
        authorProfessional:
          mode === "evaluation"
            ? (evaluation?.authorProfessional ?? null)
            : null,
        evaluation,
        evaluationReportOptions:
          mode === "evaluation" ? evaluationReportOptions : null,
        roteiro:
          mode === "roteiro"
            ? { roteiroId, categoryTick: roteiroTick }
            : null,
      });

      pdfReport.openPreview(payload);
    });
  }

  const previewTitle = useMemo(() => {
    if (mode === "roteiro") {
      const category = currentRoteiro.categories.find((c) => c.tick === roteiroTick);
      return getPatientReportTitle("roteiro", category?.title ?? currentRoteiro.label);
    }
    return getPatientReportTitle(mode);
  }, [currentRoteiro, mode, roteiroTick]);

  return {
    pdfReport,
    search,
    setSearch,
    patientId,
    mode,
    evaluationId,
    setEvaluationId,
    roteiroId,
    roteiroTick,
    setRoteiroTick,
    evaluations,
    selectedEvaluation,
    evaluationReportOptions,
    setEvaluationReportOptions,
    pending,
    filteredPatients,
    selectedPatient,
    currentRoteiro,
    previewTitle,
    handlePatientChange,
    handleEvaluationChange,
    handleModeChange,
    handleRoteiroChange,
    previewReport,
  };
}

export type RelatorioFormViewModel = ReturnType<typeof useRelatorioForm>;
