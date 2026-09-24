import { GmfmProtocolClient } from "./components/protocol-client";
import { getProtocolInstrument } from "@/domains/protocol/instruments/instruments";
import { listProtocolAssessments } from "@/domains/protocol/protocol.service";
import { GMFM88_PROTOCOL_ID } from "@/domains/protocol/instruments/fisioterapia/gmfm-88/template";
import type {
  ProtocolInstrumentModule,
  ProtocolInstrumentRenderContext,
} from "../../types";

const instrument = getProtocolInstrument(GMFM88_PROTOCOL_ID);
if (!instrument) {
  throw new Error(`Instrumento não registado: ${GMFM88_PROTOCOL_ID}`);
}

async function renderGmfm88({
  organizationId,
  patients,
  initialPatientId,
  canWrite,
}: ProtocolInstrumentRenderContext) {
  const initialProtocolAssessments = initialPatientId
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
      initialProtocolAssessments={initialProtocolAssessments}
      canWrite={canWrite}
    />
  );
}

/** Módulo UI: metadados vêm do registry server. */
export const gmfm88Module: ProtocolInstrumentModule = {
  id: instrument.id,
  name: instrument.name,
  description: instrument.description,
  professionId: instrument.professionId,
  render: renderGmfm88,
};
