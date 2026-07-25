import { anamneseRepository } from "./anamnese.repository";
import type { AnamneseDTO, AnamneseSummaryDTO } from "./anamnese.types";
import { getCatalogAnamnese } from "./forms/registry";

function parseData(raw: string): Record<string, unknown> {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function toDTO(row: {
  id: string;
  organizationId: string;
  patientId: string;
  formId: string;
  data: string;
  createdAt: Date;
  updatedAt: Date;
}): AnamneseDTO {
  return {
    id: row.id,
    organizationId: row.organizationId,
    patientId: row.patientId,
    formId: row.formId,
    data: parseData(row.data),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toAnamneseSummary(dto: AnamneseDTO): AnamneseSummaryDTO {
  return {
    id: dto.id,
    formId: dto.formId,
    label: getCatalogAnamnese(dto.formId)?.name ?? dto.formId,
    updatedAt: dto.updatedAt,
  };
}

export async function listPatientAnamneses(
  organizationId: string,
  patientId: string,
): Promise<AnamneseDTO[]> {
  const rows = await anamneseRepository.findByPatient(
    organizationId,
    patientId,
  );
  return rows.map(toDTO);
}

export async function getAnamnese(
  organizationId: string,
  patientId: string,
  formId: string,
): Promise<AnamneseDTO | null> {
  const row = await anamneseRepository.findByPatientAndForm(
    organizationId,
    patientId,
    formId,
  );
  return row ? toDTO(row) : null;
}

export async function saveAnamnese(
  organizationId: string,
  patientId: string,
  formId: string,
  data: Record<string, unknown>,
): Promise<AnamneseDTO | null> {
  const row = await anamneseRepository.upsert(
    organizationId,
    patientId,
    formId,
    data,
  );
  return row ? toDTO(row) : null;
}
