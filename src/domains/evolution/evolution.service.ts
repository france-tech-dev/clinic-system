import { toEvolutionDTO, toLinkableAppointmentDTO } from "./_lib/mappers";
import { evolutionRepository } from "./evolution.repository";
import type { EvolutionFormInput } from "./evolution.schema";

export async function listEvolutionsByPatient(
  organizationId: string,
  patientId: string,
) {
  const rows = await evolutionRepository.findByPatient(
    organizationId,
    patientId,
  );
  if (!rows) return null;
  return rows.map(toEvolutionDTO);
}

export async function listLinkableAppointments(
  organizationId: string,
  patientId: string,
) {
  const rows = await evolutionRepository.findLinkableAppointments(
    organizationId,
    patientId,
  );
  if (!rows) return null;
  return rows.map(toLinkableAppointmentDTO);
}

export async function resolveAuthorMemberId(
  organizationId: string,
  userId: string,
): Promise<string | null> {
  const member = await evolutionRepository.findMemberByUserId(
    organizationId,
    userId,
  );
  return member?.id ?? null;
}

export async function createEvolution(
  organizationId: string,
  data: EvolutionFormInput,
  memberId: string | null,
) {
  const row = await evolutionRepository.create(organizationId, data, memberId);
  return row ? toEvolutionDTO(row) : null;
}

export async function updateEvolution(
  organizationId: string,
  id: string,
  data: EvolutionFormInput,
) {
  const row = await evolutionRepository.update(organizationId, id, data);
  return row ? toEvolutionDTO(row) : null;
}

export async function deleteEvolution(organizationId: string, id: string) {
  return evolutionRepository.delete(organizationId, id);
}
