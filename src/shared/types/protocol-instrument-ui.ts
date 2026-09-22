import type { ReactNode } from "react";
import type { HealthProfessionId } from "@/shared/constants/professions";
import type { ClinicalWorkspacePatientOption } from "@/shared/types/clinical-workspace-patient";

/** Contexto comum passado pela rota `/avaliacoes/[avaliacao]`. */
export type ProtocolInstrumentRenderContext = {
  organizationId: string;
  patients: ClinicalWorkspacePatientOption[];
  initialPatientId: string | null;
  canWrite: boolean;
};

/**
 * Módulo de UI de avaliação (workspace).
 * Implementações vivem em `features/protocol`; a rota resolve pelo registry.
 */
export type ProtocolInstrumentUI = {
  id: string;
  professionId: HealthProfessionId;
  /** Carrega dados específicos e devolve o client da avaliação. */
  render: (ctx: ProtocolInstrumentRenderContext) => Promise<ReactNode>;
};
