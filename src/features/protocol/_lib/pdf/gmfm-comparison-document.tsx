import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import type { GmfmPdfComparisonPayload } from "@/domains/protocol/_lib/pdf/types";

const styles = StyleSheet.create({
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 4,
    marginBottom: 4,
    marginTop: 12,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  colTitle: { width: "40%", fontSize: 9 },
  colNum: { width: "20%", fontSize: 9, textAlign: "right" },
});

function deltaLabel(delta: number): string {
  const sign = delta >= 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)} p.p.`;
}

export function GmfmComparisonDocument({
  payload,
}: {
  payload: GmfmPdfComparisonPayload;
}) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.clinicName}>
          Comparativo — {payload.protocolName}
        </Text>
        <Text style={pdfStyles.patientLine}>
          <Text style={pdfStyles.patientName}>Criança: </Text>
          {payload.patientName}
        </Text>
        <Text style={pdfStyles.patientLine}>
          Base: {payload.baselineLabel} — {formatDateBR(payload.baselineDate)} (
          {payload.baselinePercent.toFixed(1)}%)
        </Text>
        <Text style={pdfStyles.patientLine}>
          Reavaliação: {payload.followUpLabel} —{" "}
          {formatDateBR(payload.followUpDate)} (
          {payload.followUpPercent.toFixed(1)}%)
        </Text>
        <Text style={{ ...pdfStyles.patientLine, marginTop: 8 }}>
          Evolução geral: {deltaLabel(payload.overallDeltaPercent)}
        </Text>

        <View style={styles.tableHeader}>
          <Text style={styles.colTitle}>Domínio</Text>
          <Text style={styles.colNum}>Base %</Text>
          <Text style={styles.colNum}>Reav. %</Text>
          <Text style={styles.colNum}>Δ</Text>
        </View>

        {payload.domains.map((row) => (
          <View key={row.title} style={styles.row}>
            <Text style={styles.colTitle}>{row.title}</Text>
            <Text style={styles.colNum}>
              {row.baselinePercent.toFixed(1)}%
            </Text>
            <Text style={styles.colNum}>
              {row.followUpPercent.toFixed(1)}%
            </Text>
            <Text style={styles.colNum}>{deltaLabel(row.deltaPercent)}</Text>
          </View>
        ))}
        <PageFooter />
      </Page>
    </Document>
  );
}
