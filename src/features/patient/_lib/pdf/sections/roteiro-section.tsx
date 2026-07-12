import { Text, View } from "@react-pdf/renderer";
import type { PatientReportRoteiro } from "../types";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";

type RoteiroSectionProps = {
  roteiro: PatientReportRoteiro;
};

export function RoteiroSection({ roteiro }: RoteiroSectionProps) {
  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>{roteiro.category.title}</Text>
      <Text style={[pdfStyles.paragraph, pdfStyles.muted]}>
        {roteiro.category.context}
      </Text>
      <View style={pdfStyles.tableHeader}>
        <Text style={pdfStyles.colItem}>Item</Text>
        <Text style={pdfStyles.colObserve}>O que observar</Text>
        <Text style={pdfStyles.colClinical}>Leitura clínica</Text>
      </View>
      {roteiro.category.rows.map((row) => (
        <View key={row[0]} style={pdfStyles.tableRow}>
          <Text style={pdfStyles.colItem}>{row[0]}</Text>
          <Text style={pdfStyles.colObserve}>{row[1]}</Text>
          <Text style={pdfStyles.colClinical}>{row[2]}</Text>
        </View>
      ))}
      {roteiro.notes.trim() ? (
        <View>
          <Text style={pdfStyles.subsectionTitle}>Notas de caso</Text>
          <Text style={pdfStyles.paragraph}>{roteiro.notes}</Text>
        </View>
      ) : null}
    </View>
  );
}
