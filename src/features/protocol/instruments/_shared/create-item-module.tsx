import type { ItemProtocolInstrument } from "@/domains/protocol/instruments/_shared/define-instrument";
import { listProtocolAssessments } from "@/domains/protocol/protocol.service";
import { ItemProtocolClient } from "./item-protocol-client";
import type { ProtocolInstrumentModule } from "../types";

export type { ItemProtocolInstrument };

export function createItemInstrumentModule(
  instrument: ItemProtocolInstrument,
): ProtocolInstrumentModule {
  const {
    id,
    name,
    description,
    professionId,
    template,
    supportsPublicInvite,
  } = instrument;

  return {
    id,
    name,
    description,
    professionId,
    supportsPublicInvite: supportsPublicInvite ?? true,
    template,
    render: async ({
      organizationId,
      patients,
      initialPatientId,
      canWrite,
    }) => {
      const initialProtocolAssessments = initialPatientId
        ? await listProtocolAssessments(organizationId, initialPatientId, id)
        : [];

      return (
        <ItemProtocolClient
          protocolId={id}
          protocolName={name}
          template={template}
          patients={patients}
          initialPatientId={initialPatientId}
          initialProtocolAssessments={initialProtocolAssessments}
          canWrite={canWrite}
        />
      );
    },
  };
}
