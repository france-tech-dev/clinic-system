"use client";

import { useState } from "react";
import type { PatientReportPayload } from "@/features/patient/_lib/pdf/types";

export function usePatientPdfReport() {
  const [previewPayload, setPreviewPayload] =
    useState<PatientReportPayload | null>(null);

  function openPreview(payload: PatientReportPayload) {
    setPreviewPayload(payload);
  }

  function closePreview() {
    setPreviewPayload(null);
  }

  return {
    previewPayload,
    openPreview,
    closePreview,
  };
}
