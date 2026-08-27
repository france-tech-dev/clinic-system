import type { PatientReportPayload } from "@/domains/patient/_lib/pdf/types";
import { ClinicalEvaluationDocument } from "./documents/clinical-evaluation-document";
import { FullRecordDocument } from "./documents/full-record-document";

type PatientReportDocumentProps = {
  payload: PatientReportPayload;
  logoOrigin?: string;
};

export function PatientReportDocument({
  payload,
  logoOrigin,
}: PatientReportDocumentProps) {
  switch (payload.mode) {
    case "evaluation":
      return <ClinicalEvaluationDocument payload={payload} logoOrigin={logoOrigin} />;
    case "full":
    default:
      return <FullRecordDocument payload={payload} logoOrigin={logoOrigin} />;
  }
}
