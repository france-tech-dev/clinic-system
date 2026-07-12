import { Document, Page } from "@react-pdf/renderer";
import { ClinicHeader } from "@/shared/lib/pdf/components/clinic-header";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { PatientInfo } from "@/shared/lib/pdf/components/patient-info";
import { SignatureFooter } from "@/shared/lib/pdf/components/signature-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { getPatientReportTitle } from "../report-meta";
import type { PatientReportPayload } from "../types";
import { AnamneseSection } from "../sections/anamnese-section";
import { EvaluationSection } from "../sections/evaluation-section";
import { PlanSection } from "../sections/plan-section";
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
        <EvaluationSection
          evaluations={payload.evaluations}
          selectedEvaluation={payload.selectedEvaluation}
        />
        <AnamneseSection anamneseData={payload.anamneseData} />
        <PlanSection planItems={payload.planItems} />
        <SessionsSection sessionNotes={payload.sessionNotes} />
        <SignatureFooter signature={signature} />
        <PageFooter />
      </Page>
    </Document>
  );
}
