import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";
import type { AnamneseField, AnamneseSection } from "./field-types";

function fieldRows(
  field: AnamneseField,
  data: Record<string, unknown>,
): { label: string; value: string }[] {
  if (field.type === "rating-grid" && field.items) {
    return field.items
      .map((item) => {
        const value = String(data[`${field.id}::${item}`] ?? "").trim();
        return value ? { label: `${field.label} — ${item}`, value } : null;
      })
      .filter((row): row is { label: string; value: string } => row !== null);
  }

  if (field.type === "status-table" && Array.isArray(field.rows)) {
    return field.rows
      .map((row) => {
        const value = String(data[`${field.id}::${row}`] ?? "").trim();
        return value ? { label: `${field.label} — ${row}`, value } : null;
      })
      .filter((r): r is { label: string; value: string } => r !== null);
  }

  const value = String(data[field.id] ?? "").trim();
  return value ? [{ label: field.label, value }] : [];
}

/** Achata qualquer schema de anamnese em secções label/valor para PDF. */
export function flattenAnamneseForPdf(
  schema: AnamneseSection[],
  data: Record<string, unknown>,
): PdfKeyValueSection[] {
  return schema
    .map((section) => {
      const rows = section.fields.flatMap((field) => fieldRows(field, data));
      return rows.length > 0 ? { title: section.title, rows } : null;
    })
    .filter((section): section is PdfKeyValueSection => section !== null);
}
