import { RoteiroWorkspaceClient } from "@/features/patient/components/roteiro-workspace-client";
import { listRoteiroNotes } from "@/features/patient/patient.service";
import { ROTEIROS, type RoteiroId } from "@/shared/constants/roteiros";
import type {
  AssessmentRenderContext,
  AssessmentUiModule,
} from "@/shared/types/assessment-ui";

function createRoteiroAssessmentUi(roteiroId: RoteiroId): AssessmentUiModule {
  return {
    id: roteiroId,
    professionId: "terapeuta_ocupacional",
    async render({
      organizationId,
      patients,
      initialPatientId,
    }: AssessmentRenderContext) {
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
export const roteiroAssessmentUiModules: AssessmentUiModule[] = ROTEIROS.map(
  (roteiro) => createRoteiroAssessmentUi(roteiro.id),
);

export function getRoteiroAssessmentUi(
  avaliacaoId: string,
): AssessmentUiModule | undefined {
  return roteiroAssessmentUiModules.find((mod) => mod.id === avaliacaoId);
}
