import { getAnamneseForm, getCatalogAnamnese } from "../../forms/registry";
import { flattenAnamneseForPdf } from "../../forms/flatten-for-pdf";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";

/** Resolve blocos planos de PDF (workspace e prontuário completo via app/). */
export function buildAnamnesePdfBlocks(
  formId: string,
  data: Record<string, unknown>,
): PdfKeyValueSection[] {
  const form = getAnamneseForm(formId);
  if (!form) return [];
  return flattenAnamneseForPdf(form.schema, data);
}

export function getAnamneseDocumentTitle(formId: string): string {
  return getCatalogAnamnese(formId)?.name ?? "Anamnese";
}
