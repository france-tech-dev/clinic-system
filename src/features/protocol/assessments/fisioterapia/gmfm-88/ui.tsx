import { GmfmProtocolClient } from "./components/protocol-client";
import { listProtocolAssessments } from "@/features/protocol/protocol.service";
import type { AssessmentRenderContext, AssessmentUiModule } from "../../types";
import { GMFM88_PROTOCOL_ID } from "./template";

async function renderGmfm88({
  organizationId,
  patients,
  initialPatientId,
}: AssessmentRenderContext) {
  const initialAssessments = initialPatientId
    ? await listProtocolAssessments(
        organizationId,
        initialPatientId,
        GMFM88_PROTOCOL_ID,
      )
    : [];

  return (
    <GmfmProtocolClient
      patients={patients}
      initialPatientId={initialPatientId}
      initialAssessments={initialAssessments}
    />
  );
}

export const gmfm88AssessmentUi: AssessmentUiModule = {
  id: GMFM88_PROTOCOL_ID,
  professionId: "fisioterapeuta",
  render: renderGmfm88,
};
