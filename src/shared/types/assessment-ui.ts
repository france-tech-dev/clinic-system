import type { ReactNode } from "react";
import type { HealthProfessionId } from "@/shared/constants/professions";
import type { AssessmentPatientOption } from "@/shared/types/assessment-patient";

/** Contexto comum passado pela rota `/avaliacoes/[avaliacao]`. */
export type AssessmentRenderContext = {
  organizationId: string;
  patients: AssessmentPatientOption[];
  initialPatientId: string | null;
};

/**
 * Módulo de UI de avaliação (workspace).
 * Implementações vivem em features/; se cruzarem features, a composição
 * final do registry faz-se em `app/` (features não se importam).
 */
export type AssessmentUiModule = {
  id: string;
  professionId: HealthProfessionId;
  /** Carrega dados específicos e devolve o client da avaliação. */
  render: (ctx: AssessmentRenderContext) => Promise<ReactNode>;
};
