import { DEFAULT_STUDY } from "@/shared/constants/default-study";
import { ensureDefaultStudy } from "@/shared/lib/seed-study";
import { studyRepository } from "./study.repository";
import type { StudyFormInput } from "./study.schema";
import type { StudyCardDTO } from "./study.types";

function toDTO(row: {
  id: string;
  title: string;
  categoryId: string;
  content: string;
  isCustom: boolean;
  seedKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}): StudyCardDTO {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.categoryId,
    content: row.content,
    isCustom: row.isCustom,
    seedKey: row.seedKey,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listStudyCards(
  organizationId: string,
  opts?: { search?: string; categoryId?: string | null },
) {
  await ensureDefaultStudy(organizationId);
  const rows = await studyRepository.findMany(organizationId, opts);
  return rows.map(toDTO);
}

export async function getStudyCard(organizationId: string, id: string) {
  const row = await studyRepository.findById(organizationId, id);
  return row ? toDTO(row) : null;
}

export async function createStudyCard(
  organizationId: string,
  data: StudyFormInput,
) {
  const row = await studyRepository.create(organizationId, {
    ...data,
    isCustom: true,
    seedKey: null,
  });
  return toDTO(row);
}

export async function updateStudyCard(
  organizationId: string,
  id: string,
  data: StudyFormInput,
) {
  const row = await studyRepository.update(organizationId, id, data);
  return row ? toDTO(row) : null;
}

export async function deleteStudyCard(organizationId: string, id: string) {
  const row = await studyRepository.delete(organizationId, id);
  return row ? toDTO(row) : null;
}

/** Reinsere apenas os resumos padrão que ainda não existem (por seedKey). */
export async function restoreDefaultStudy(organizationId: string) {
  const existing = await studyRepository.findSeedKeys(organizationId);
  const missing = DEFAULT_STUDY.filter((d) => !existing.has(d.seedKey));
  if (missing.length > 0) {
    await studyRepository.createMany(
      organizationId,
      missing.map((item) => ({
        title: item.title,
        categoryId: item.categoryId,
        content: item.content,
        isCustom: false,
        seedKey: item.seedKey,
      })),
    );
  }
  return listStudyCards(organizationId);
}
