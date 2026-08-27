import { ItemProtocolClient } from "./item-protocol-client";
import { listProtocolEvaluations } from "@/domains/protocol/protocol.service";
import type {
  ProtocolInstrument,
} from "@/domains/protocol/evaluation-modules/instruments";
import type { EvaluationModule } from "@/domains/protocol/evaluation-modules/types";
import type { ItemProtocolTemplate } from "@/domains/protocol/evaluation-modules/_shared/item-protocol-template";

/** Instrumento com template de itens (PEDI, SPM, Perfil, …). */
export type ItemProtocolInstrument = ProtocolInstrument & {
  template: ItemProtocolTemplate;
};

export function createItemEvaluationModule(
  instrument: ItemProtocolInstrument,
): EvaluationModule {
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
      const initialProtocolEvaluations = initialPatientId
        ? await listProtocolEvaluations(organizationId, initialPatientId, id)
        : [];

      return (
        <ItemProtocolClient
          protocolId={id}
          protocolName={name}
          template={template}
          patients={patients}
          initialPatientId={initialPatientId}
          initialProtocolEvaluations={initialProtocolEvaluations}
          canWrite={canWrite}
        />
      );
    },
  };
}
