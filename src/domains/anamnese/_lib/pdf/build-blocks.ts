import { ANAMNESE_TO_FORM_ID } from "../../forms/catalog";
import { flattenAnamneseForPdf } from "../../forms/flatten-for-pdf";
import { ANAMNESE_SCHEMA } from "../../forms/terapia-ocupacional/anamnese-to/schema";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import { getCatalogAnamnese } from "../../forms/catalog";

const SCHEMA_BY_FORM_ID: Record<string, typeof ANAMNESE_SCHEMA> = {
  [ANAMNESE_TO_FORM_ID]: ANAMNESE_SCHEMA,
};

/** Resolve blocos planos de PDF (workspace e prontuário completo via app/). */
export function buildAnamnesePdfBlocks(
  formId: string,
  data: Record<string, unknown>,
): PdfKeyValueSection[] {
  const schema = SCHEMA_BY_FORM_ID[formId];
  if (!schema) return [];
  return flattenAnamneseForPdf(schema, data);
}

export function getAnamneseDocumentTitle(formId: string): string {
  return getCatalogAnamnese(formId)?.name ?? "Anamnese";
}
