import { GmfmProtocolClient } from "./components/protocol-client";
import { listProtocolEvaluations } from "@/domains/protocol/protocol.service";
import type {
  EvaluationModule,
  EvaluationModuleRenderContext,
} from "@/domains/protocol/evaluation-modules/types";
import { GMFM88_PROTOCOL_ID } from "@/domains/protocol/evaluation-modules/fisioterapia/gmfm-88/template";

const MODULE_NAME = "GMFM-88";
const MODULE_DESCRIPTION =
  "Avalia a função motora grossa em 5 domínios (88 itens).";

async function renderGmfm88({
  organizationId,
  patients,
  initialPatientId,
  canWrite,
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
      canWrite={canWrite}
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
