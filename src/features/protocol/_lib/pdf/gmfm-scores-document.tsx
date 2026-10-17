import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import type { GmfmPdfScoresPayload } from "@/domains/protocol/_lib/pdf/types";

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
  colDomain: { width: "12%", fontSize: 9, fontWeight: 600 },
  colTitle: { width: "48%", fontSize: 9 },
  colNum: { width: "20%", fontSize: 9, textAlign: "right" },
});

export function GmfmScoresDocument({
  payload,
}: {
  payload: GmfmPdfScoresPayload;
}) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.clinicName}>
          Scores — {payload.protocolName}
        </Text>
        <Text style={pdfStyles.patientLine}>
          <Text style={pdfStyles.patientName}>Criança: </Text>
          {payload.patientName}
        </Text>
        {payload.professionalName ? (
          <Text style={pdfStyles.patientLine}>
            Terapeuta: {payload.professionalName}
          </Text>
        ) : null}
        <Text style={pdfStyles.patientLine}>
          Data: {formatDateBR(payload.date)} · {payload.label}
        </Text>
        <Text style={{ ...pdfStyles.patientLine, marginTop: 8 }}>
          Total: {payload.totalScore}/{payload.maxScore} (
          {payload.percent.toFixed(1)}%)
        </Text>

        <View style={styles.tableHeader}>
          <Text style={styles.colDomain}>Dom.</Text>
          <Text style={styles.colTitle}>Domínio</Text>
          <Text style={styles.colNum}>Escore</Text>
          <Text style={styles.colNum}>%</Text>
        </View>

        {payload.domains.map((row) => (
          <View key={row.domainId} style={styles.row}>
            <Text style={styles.colDomain}>{row.domainId}</Text>
            <Text style={styles.colTitle}>{row.title}</Text>
            <Text style={styles.colNum}>
              {row.totalScore}/{row.maxScore}
            </Text>
            <Text style={styles.colNum}>{row.percent.toFixed(1)}%</Text>
          </View>
        ))}
        <PageFooter />
      </Page>
    </Document>
  );
}
