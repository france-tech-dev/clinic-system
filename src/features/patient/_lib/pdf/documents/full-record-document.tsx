import { Document, Page } from "@react-pdf/renderer";
import { ClinicHeader } from "@/shared/lib/pdf/components/clinic-header";
import { KeyValueSections } from "@/shared/lib/pdf/components/key-value-sections";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { PatientInfo } from "@/shared/lib/pdf/components/patient-info";
import { SignatureFooter } from "@/shared/lib/pdf/components/signature-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { getPatientReportTitle } from "../report-meta";
import type { PatientReportPayload } from "../types";
import { ClinicalEvaluationSection } from "../sections/clinical-evaluation-section";
import { SessionsSection } from "../sections/sessions-section";

type PatientReportDocumentProps = {
  payload: PatientReportPayload;
  logoOrigin?: string;
};

export function FullRecordDocument({
  payload,
  logoOrigin,
}: PatientReportDocumentProps) {
  const { branding, patientName, signature } = payload;
  const documentTitle = getPatientReportTitle("full");

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
        <ClinicalEvaluationSection
          clinicalEvaluations={payload.clinicalEvaluations}
          selectedEvaluation={payload.selectedEvaluation}
        />
        <KeyValueSections
          heading="Anamnese"
          sections={payload.anamneseSections}
        />
        <SessionsSection sessionNotes={payload.sessionNotes} />
        <SignatureFooter signature={signature} />
        <PageFooter />
      </Page>
    </Document>
  );
}
