import { Text, View } from "@react-pdf/renderer";
import {
  ANAMNESE_SCHEMA,
  type AnamneseField,
  type AnamneseSection as AnamneseSchemaSection,
} from "@/features/patient/_lib/anamnese-schema";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";

type AnamneseSectionProps = {
  anamneseData: Record<string, unknown>;
};

function hasAnamneseFieldContent(
  field: AnamneseField,
  anamneseData: Record<string, unknown>,
): boolean {
  if (field.type === "rating-grid" && field.items) {
    return field.items.some(
      (item) =>
        String(anamneseData[`${field.id}::${item}`] ?? "").trim().length > 0,
    );
  }

  if (field.type === "status-table" && Array.isArray(field.rows)) {
    return field.rows.some(
      (row) =>
        String(anamneseData[`${field.id}::${row}`] ?? "").trim().length > 0,
    );
  }

  return String(anamneseData[field.id] ?? "").trim().length > 0;
}

function hasAnamneseSectionContent(
  section: AnamneseSchemaSection,
  anamneseData: Record<string, unknown>,
): boolean {
  return section.fields.some((field) =>
    hasAnamneseFieldContent(field, anamneseData),
  );
}

function renderAnamneseField(
  field: AnamneseField,
  anamneseData: Record<string, unknown>,
) {
  const val = String(anamneseData[field.id] ?? "").trim();
  if (
    !val &&
    field.type !== "rating-grid" &&
    field.type !== "status-table"
  ) {
    return null;
  }

  if (field.type === "rating-grid" && field.items) {
    return field.items.map((item) => {
      const itemValue = String(
        anamneseData[`${field.id}::${item}`] ?? "",
      ).trim();
      if (!itemValue) return null;
      return (
        <Text key={`${field.id}-${item}`} style={pdfStyles.bulletItem}>
          • {item}: {itemValue}
        </Text>
      );
    });
  }

  if (field.type === "status-table" && Array.isArray(field.rows)) {
    return field.rows.map((row) => {
      const rowValue = String(anamneseData[`${field.id}::${row}`] ?? "").trim();
      if (!rowValue) return null;
      return (
        <Text key={`${field.id}-${row}`} style={pdfStyles.bulletItem}>
          • {row}: {rowValue}
        </Text>
      );
    });
  }

  return (
    <Text key={field.id} style={pdfStyles.bulletItem}>
      • {field.label}: {val}
    </Text>
  );
}

export function AnamneseSection({ anamneseData }: AnamneseSectionProps) {
  const sectionsWithContent = ANAMNESE_SCHEMA.filter((section) =>
    hasAnamneseSectionContent(section, anamneseData),
  );

  if (sectionsWithContent.length === 0) {
    return null;
  }

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>Anamnese</Text>
      {sectionsWithContent.map((section) => (
        <View key={section.id}>
          <Text style={pdfStyles.subsectionTitle}>{section.title}</Text>
          {section.fields.map((field) => renderAnamneseField(field, anamneseData))}
        </View>
      ))}
    </View>
  );
}
