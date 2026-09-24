import type { EvolutionStatus } from "@prisma/enums";

export type { EvolutionStatus };

export type EvolutionDTO = {
  id: string;
  patientId: string;
  appointmentId: string | null;
  memberId: string | null;
  professionalName: string | null;
  date: string;
  time: string;
  status: EvolutionStatus;
  activities: string;
  observations: string;
  createdAt: string;
  updatedAt: string;
};

/** Agendamento do paciente para vincular a uma evolução. */
export type LinkableAppointmentDTO = {
  id: string;
  date: string;
  time: string;
  status: string;
  professionalName: string | null;
  /** Id da evolução já ligada, se houver. */
  evolutionId: string | null;
};
