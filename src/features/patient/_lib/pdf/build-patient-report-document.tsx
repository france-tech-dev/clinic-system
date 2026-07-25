import type { PatientReportPayload } from "./types";
import { EvaluationDocument } from "./documents/evaluation-document";
import { FullRecordDocument } from "./documents/full-record-document";
import { RoteiroDocument } from "./documents/roteiro-document";

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
      return <EvaluationDocument payload={payload} logoOrigin={logoOrigin} />;
    case "roteiro":
      return <RoteiroDocument payload={payload} logoOrigin={logoOrigin} />;
    case "full":
    default:
      return <FullRecordDocument payload={payload} logoOrigin={logoOrigin} />;
  }
}
