import { AssessmentDocument } from "@/features/assessment/_lib/pdf/documents/assessment-document";
import { AssessmentSection } from "@/features/assessment/_lib/pdf/sections/assessment-section";
import { EvolutionsSection } from "@/features/patient/_lib/pdf/sections/evolutions-section";
import type { PatientReportPayload } from "@/application/patient";
import { getPatientReportTitle } from "@/domains/patient/_lib/pdf/report-meta";
import { ClinicHeader } from "@/shared/lib/pdf/components/clinic-header";
import { KeyValueSections } from "@/shared/lib/pdf/components/key-value-sections";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { PatientInfo } from "@/shared/lib/pdf/components/patient-info";
import { SignatureFooter } from "@/shared/lib/pdf/components/signature-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { Document, Page } from "@react-pdf/renderer";

type Props = {
  payload: PatientReportPayload;
  logoOrigin?: string;
};

function FullRecordDocument({ payload, logoOrigin }: Props) {
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
        <AssessmentSection
          assessments={payload.assessments}
          selectedAssessment={payload.selectedAssessment}
        />
        <KeyValueSections
          heading="Anamnese"
          sections={payload.anamneseSections}
        />
        <EvolutionsSection evolutions={payload.evolutions} />
        <SignatureFooter signature={signature} />
        <PageFooter />
      </Page>
    </Document>
  );
}

export function PatientReportDocument({ payload, logoOrigin }: Props) {
  switch (payload.mode) {
    case "evaluation":
      return <AssessmentDocument payload={payload} logoOrigin={logoOrigin} />;
    case "full":
    default:
      return <FullRecordDocument payload={payload} logoOrigin={logoOrigin} />;
  }
}
