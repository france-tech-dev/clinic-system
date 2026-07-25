import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import type { PdfKeyValueSection } from "@/shared/types/pdf-sections";

/** Secções label/valor genéricas — usáveis por qualquer feature via app/. */
export function KeyValueSections({
  heading,
  sections,
}: {
  heading?: string;
  sections: PdfKeyValueSection[];
}) {
  if (sections.length === 0) return null;

  return (
    <View>
      {heading ? <Text style={pdfStyles.sectionTitle}>{heading}</Text> : null}
      {sections.map((section) => (
        <View key={section.title}>
          <Text style={pdfStyles.subsectionTitle}>{section.title}</Text>
          {section.rows.map((row) => (
            <Text
              key={`${section.title}-${row.label}`}
              style={pdfStyles.bulletItem}
            >
              • {row.label}: {row.value}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
