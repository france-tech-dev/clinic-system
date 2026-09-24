import type {
  EvolutionDTO,
  EvolutionStatus,
  LinkableAppointmentDTO,
} from "../evolution.types";

export function toEvolutionDTO(row: {
  id: string;
  patientId: string;
  appointmentId?: string | null;
  memberId?: string | null;
  date: string;
  time: string;
  status: EvolutionStatus;
  activities: string;
  observations: string;
  createdAt: Date;
  updatedAt: Date;
  member?: { user: { name: string | null } } | null;
}): EvolutionDTO {
  return {
    id: row.id,
    patientId: row.patientId,
    appointmentId: row.appointmentId ?? null,
    memberId: row.memberId ?? null,
    professionalName: row.member?.user.name?.trim() || null,
    date: row.date,
    time: row.time ?? "",
    status: row.status,
    activities: row.activities,
    observations: row.observations,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toLinkableAppointmentDTO(row: {
  id: string;
  date: string;
  time: string;
  status: string;
  evolution?: { id: string } | null;
  member?: { user: { name: string | null } } | null;
}): LinkableAppointmentDTO {
  return {
    id: row.id,
    date: row.date,
    time: row.time ?? "",
    status: row.status,
    professionalName: row.member?.user.name?.trim() || null,
    evolutionId: row.evolution?.id ?? null,
  };
}
