import type { ReactNode } from "react";
import type { HealthProfessionId } from "@/shared/constants/professions";
import type { EvaluationModulePatientOption } from "@/shared/types/evaluation-module-patient";

/** Contexto comum passado pela rota `/avaliacoes/[avaliacao]`. */
export type EvaluationModuleRenderContext = {
  organizationId: string;
  patients: EvaluationModulePatientOption[];
  initialPatientId: string | null;
  canWrite: boolean;
};

/**
 * Módulo de UI de avaliação (workspace).
 * Implementações vivem em `features/protocol`; a rota resolve pelo registry.
 */
export type EvaluationModuleUI = {
  id: string;
  professionId: HealthProfessionId;
  /** Carrega dados específicos e devolve o client da avaliação. */
  render: (ctx: EvaluationModuleRenderContext) => Promise<ReactNode>;
};
