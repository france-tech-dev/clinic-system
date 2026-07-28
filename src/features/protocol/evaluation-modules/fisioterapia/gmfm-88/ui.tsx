import { GmfmProtocolClient } from "./components/protocol-client";
import { listProtocolEvaluations } from "@/features/protocol/protocol.service";
import type { EvaluationModuleRenderContext, EvaluationModuleUI } from "../../types";
import { GMFM88_PROTOCOL_ID } from "./template";

async function renderGmfm88({
  organizationId,
  patients,
  initialPatientId,
}: EvaluationModuleRenderContext) {
  const initialProtocolEvaluations = initialPatientId
    ? await listProtocolEvaluations(
        organizationId,
        initialPatientId,
        GMFM88_PROTOCOL_ID,
      )
    : [];

  return (
    <GmfmProtocolClient
      patients={patients}
      initialPatientId={initialPatientId}
      initialProtocolEvaluations={initialProtocolEvaluations}
    />
  );
}

export const gmfm88EvaluationModuleUI: EvaluationModuleUI = {
  id: GMFM88_PROTOCOL_ID,
  professionId: "fisioterapeuta",
  render: renderGmfm88,
};
