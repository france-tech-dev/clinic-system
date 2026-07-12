import { Document, Page } from "@react-pdf/renderer";
import { ClinicHeader } from "@/shared/lib/pdf/components/clinic-header";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { PatientInfo } from "@/shared/lib/pdf/components/patient-info";
import { SignatureFooter } from "@/shared/lib/pdf/components/signature-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { getPatientReportTitle } from "../report-meta";
import type { PatientReportPayload } from "../types";
import { RoteiroSection } from "../sections/roteiro-section";

type PatientReportDocumentProps = {
  payload: PatientReportPayload;
  logoOrigin?: string;
};

export function RoteiroDocument({
  payload,
  logoOrigin,
}: PatientReportDocumentProps) {
  const { branding, patientName, signature, roteiro } = payload;
  const documentTitle = getPatientReportTitle("roteiro", roteiro?.label);

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
        {roteiro ? <RoteiroSection roteiro={roteiro} /> : null}
        <SignatureFooter signature={signature} />
        <PageFooter />
      </Page>
    </Document>
  );
}
