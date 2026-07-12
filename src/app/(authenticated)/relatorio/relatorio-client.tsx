"use client";

import { PatientPdfPreviewDialog } from "@/features/patient/components/patient-pdf-preview-dialog";
import type { EvaluationDTO, PatientDTO } from "@/features/patient/patient.types";
import type { PrintBranding, ProfessionalProfile } from "@/features/settings/settings.types";
import { ReportFormCard } from "./_components/report-form-card";
import { useRelatorioForm } from "./_components/hooks/use-relatorio-form";

export function RelatorioClient({
  patients,
  professional,
  branding,
  initialPatientId,
  initialEvaluations,
  initialEvaluationId,
}: {
  patients: PatientDTO[];
  professional: ProfessionalProfile;
  branding: PrintBranding;
  initialPatientId: string | null;
  initialEvaluations: EvaluationDTO[];
  initialEvaluationId: string;
}) {
  const form = useRelatorioForm({
    patients,
    professional,
    branding,
    initialPatientId,
    initialEvaluations,
    initialEvaluationId,
  });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Gere relatórios PDF sem abrir o prontuário do paciente. Escolha o
        paciente, o tipo de documento e visualize ou baixe o PDF.
      </p>

      <ReportFormCard form={form} />

      <PatientPdfPreviewDialog
        payload={form.pdfReport.previewPayload}
        onClose={form.pdfReport.closePreview}
      />
    </div>
  );
}
