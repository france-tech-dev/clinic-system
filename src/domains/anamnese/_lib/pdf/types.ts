import type { PrintBranding } from "@/shared/types/professional";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";

export type AnamneseReportPayload = {
  documentTitle: string;
  patientName: string;
  signature: string;
  branding: PrintBranding;
  sections: PdfKeyValueSection[];
};
