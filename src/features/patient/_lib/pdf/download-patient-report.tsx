import { downloadPdfBlob, renderPdfBlob } from "@/shared/lib/pdf/generate";
import { PatientReportDocument } from "./build-patient-report-document";
import { buildPatientReportFilename } from "./report-meta";
import type { PatientReportPayload } from "./types";

export async function downloadPatientReport(
  payload: PatientReportPayload,
  logoOrigin?: string,
): Promise<void> {
  const blob = await renderPdfBlob(
    <PatientReportDocument payload={payload} logoOrigin={logoOrigin} />,
  );

  await downloadPdfBlob(
    blob,
    buildPatientReportFilename(
      payload.patientName,
      payload.mode,
      payload.roteiro?.label,
    ),
  );
}
