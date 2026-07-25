import { Document, Page } from "@react-pdf/renderer";
import { ClinicHeader } from "@/shared/lib/pdf/components/clinic-header";
import { KeyValueSections } from "@/shared/lib/pdf/components/key-value-sections";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { PatientInfo } from "@/shared/lib/pdf/components/patient-info";
import { SignatureFooter } from "@/shared/lib/pdf/components/signature-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import type { AnamneseReportPayload } from "../types";

export function AnamneseDocument({
  payload,
  logoOrigin,
}: {
  payload: AnamneseReportPayload;
  logoOrigin?: string;
}) {
  const { branding, patientName, signature, documentTitle, sections } = payload;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        <ClinicHeader
          clinicName={branding.clinicName}
          logoUrl={branding.logoUrl}
          documentTitle={documentTitle}
          logoOrigin={logoOrigin}
        />
        <PatientInfo patientName={patientName} />
        <KeyValueSections heading="Anamnese" sections={sections} />
        <SignatureFooter signature={signature} />
        <PageFooter />
      </Page>
    </Document>
  );
}
