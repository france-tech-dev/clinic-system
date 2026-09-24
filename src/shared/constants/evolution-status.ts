import { EvolutionStatus } from "@prisma/enums";

export const EVOLUTION_STATUS_LABEL = {
  [EvolutionStatus.ATTENDED]: "Compareceu",
  [EvolutionStatus.ABSENT]: "Faltou",
  [EvolutionStatus.CANCELLED]: "Cancelado",
} as const satisfies Record<EvolutionStatus, string>;

export function evolutionStatusLabel(status: EvolutionStatus): string {
  return EVOLUTION_STATUS_LABEL[status];
}

export const EVOLUTION_STATUSES = [
  EvolutionStatus.ATTENDED,
  EvolutionStatus.ABSENT,
  EvolutionStatus.CANCELLED,
] as const;
