import { downloadPdfBlob, renderPdfBlob } from "@/shared/lib/pdf/generate";
import { PatientReportDocument } from "./build-patient-report-document";
import { buildPatientReportFilename } from "@/domains/patient/_lib/pdf/report-meta";
import type { PatientReportPayload } from "@/domains/patient/_lib/pdf/types";

export async function downloadPatientReport(
  payload: PatientReportPayload,
  logoOrigin?: string,
): Promise<void> {
  const blob = await renderPdfBlob(
    <PatientReportDocument payload={payload} logoOrigin={logoOrigin} />,
  );

  await downloadPdfBlob(
    blob,
    buildPatientReportFilename(payload.patientName, payload.mode),
  );
}
