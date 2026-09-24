import type { PatientReportPayload } from "@/application/patient";
import { getPatientReportTitle } from "@/domains/patient/_lib/pdf/report-meta";
import { ClinicHeader } from "@/shared/lib/pdf/components/clinic-header";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { PatientInfo } from "@/shared/lib/pdf/components/patient-info";
import { SignatureFooter } from "@/shared/lib/pdf/components/signature-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { Document, Page } from "@react-pdf/renderer";
import { AssessmentSection } from "../sections/assessment-section";

type AssessmentDocumentProps = {
  payload: PatientReportPayload;
  logoOrigin?: string;
};

export function AssessmentDocument({
  payload,
  logoOrigin,
}: AssessmentDocumentProps) {
  const { branding, patientName, signature } = payload;
  const documentTitle = getPatientReportTitle("evaluation");

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
        <AssessmentSection
          assessments={payload.assessments}
          selectedAssessment={payload.selectedAssessment}
          assessmentReportOptions={payload.assessmentReportOptions}
          single
        />
        <SignatureFooter signature={signature} />
        <PageFooter />
      </Page>
    </Document>
  );
}
