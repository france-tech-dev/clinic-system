"use client";

import { useState } from "react";
import type { EvaluationDTO } from "@/features/patient/patient.types";
import type { PatientPrintMode } from "../patient-print-report";

export function usePatientPrint() {
  const [printMode, setPrintMode] = useState<PatientPrintMode | null>(null);
  const [printEval, setPrintEval] = useState<EvaluationDTO | null>(null);

  function runPrint(mode: PatientPrintMode, evaluation?: EvaluationDTO) {
    setPrintMode(mode);
    setPrintEval(evaluation ?? null);
    requestAnimationFrame(() => {
      window.print();
      setTimeout(() => {
        setPrintMode(null);
        setPrintEval(null);
      }, 300);
    });
  }

  return { printMode, printEval, runPrint };
}
