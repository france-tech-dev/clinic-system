import { ItemProtocolClient } from "./item-protocol-client";
import { listProtocolEvaluations } from "@/domains/protocol/protocol.service";
import type { EvaluationModule } from "@/domains/protocol/evaluation-modules/types";
import type { ItemProtocolTemplate } from "@/domains/protocol/evaluation-modules/_shared/item-protocol-template";
import type { HealthProfessionId } from "@/shared/constants/professions";

const TO_PROFESSION = "terapeuta_ocupacional" satisfies HealthProfessionId;

export function createItemEvaluationModule(def: {
  id: string;
  name: string;
  description: string;
  template: ItemProtocolTemplate;
}): EvaluationModule {
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    professionId: TO_PROFESSION,
    supportsPublicInvite: true,
    template: def.template,
    render: async ({
      organizationId,
      patients,
      initialPatientId,
      canWrite,
    }) => {
      const initialProtocolEvaluations = initialPatientId
        ? await listProtocolEvaluations(
            organizationId,
            initialPatientId,
            def.id,
          )
        : [];

      return (
        <ItemProtocolClient
          protocolId={def.id}
          protocolName={def.name}
          template={def.template}
          patients={patients}
          initialPatientId={initialPatientId}
          initialProtocolEvaluations={initialProtocolEvaluations}
          canWrite={canWrite}
        />
      );
    },
  };
}
