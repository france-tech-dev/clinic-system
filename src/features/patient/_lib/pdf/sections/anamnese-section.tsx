import { Text, View } from "@react-pdf/renderer";
import { ANAMNESE_SCHEMA } from "@/features/patient/_lib/anamnese-schema";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";

type AnamneseSectionProps = {
  anamneseData: Record<string, unknown>;
};

export function AnamneseSection({ anamneseData }: AnamneseSectionProps) {
  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>Anamnese</Text>
      {ANAMNESE_SCHEMA.map((sec) => (
        <View key={sec.id}>
          <Text style={pdfStyles.subsectionTitle}>{sec.title}</Text>
          {sec.fields.map((field) => {
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
                const v = String(
                  anamneseData[`${field.id}::${item}`] ?? "",
                ).trim();
                if (!v) return null;
                return (
                  <Text key={`${field.id}-${item}`} style={pdfStyles.bulletItem}>
                    • {item}: {v}
                  </Text>
                );
              });
            }
            if (field.type === "status-table" && Array.isArray(field.rows)) {
              return field.rows.map((row) => {
                const v = String(
                  anamneseData[`${field.id}::${row}`] ?? "",
                ).trim();
                if (!v) return null;
                return (
                  <Text key={`${field.id}-${row}`} style={pdfStyles.bulletItem}>
                    • {row}: {v}
                  </Text>
                );
              });
            }
            return (
              <Text key={field.id} style={pdfStyles.bulletItem}>
                • {field.label}: {val}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}
