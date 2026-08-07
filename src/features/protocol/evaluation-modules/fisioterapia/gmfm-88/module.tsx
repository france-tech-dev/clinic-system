import { GmfmProtocolClient } from "./components/protocol-client";
import { listProtocolEvaluations } from "@/features/protocol/protocol.service";
import type {
  EvaluationModule,
  EvaluationModuleRenderContext,
} from "../../types";
import { GMFM88_PROTOCOL_ID } from "./template";

const MODULE_NAME = "GMFM-88";
const MODULE_DESCRIPTION =
  "Gross Motor Function Measure — avaliação da função motora grossa em 5 domínios.";

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

/** Módulo único: catálogo + UI. */
export const gmfm88Module: EvaluationModule = {
  id: GMFM88_PROTOCOL_ID,
  name: MODULE_NAME,
  description: MODULE_DESCRIPTION,
  professionId: "fisioterapeuta",
  render: renderGmfm88,
};
