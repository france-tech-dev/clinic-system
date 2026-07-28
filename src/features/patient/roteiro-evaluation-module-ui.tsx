import { RoteiroWorkspaceClient } from "@/features/patient/components/roteiro-workspace-client";
import { listRoteiroNotes } from "@/features/patient/patient.service";
import { ROTEIROS, type RoteiroId } from "@/shared/constants/roteiros";
import type {
  EvaluationModuleRenderContext,
  EvaluationModuleUI,
} from "@/shared/types/evaluation-module-ui";

function createRoteiroEvaluationModuleUI(roteiroId: RoteiroId): EvaluationModuleUI {
  return {
    id: roteiroId,
    professionId: "terapeuta_ocupacional",
    async render({
      organizationId,
      patients,
      initialPatientId,
    }: EvaluationModuleRenderContext) {
      const initialNotes = initialPatientId
        ? ((await listRoteiroNotes(organizationId, initialPatientId)) ?? [])
        : [];

      return (
        <RoteiroWorkspaceClient
          roteiroId={roteiroId}
          patients={patients}
          initialPatientId={initialPatientId}
          initialNotes={initialNotes}
        />
      );
    },
  };
}

/** UIs de roteiro T.O. — compostas em `app/` com o registry de protocol. */
export const roteiroEvaluationModuleUIs: EvaluationModuleUI[] = ROTEIROS.map(
  (roteiro) => createRoteiroEvaluationModuleUI(roteiro.id),
);

export function getRoteiroEvaluationModuleUI(
  avaliacaoId: string,
): EvaluationModuleUI | undefined {
  return roteiroEvaluationModuleUIs.find((mod) => mod.id === avaliacaoId);
}
