import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import { SPM_BAND_LABELS } from "@/domains/protocol/instruments/terapia-ocupacional/_lib/spm/score";
import type { SpmPdfScoresPayload } from "@/domains/protocol/_lib/pdf/types";

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
  colCode: { width: "12%", fontSize: 9, fontWeight: 600 },
  colTitle: { width: "28%", fontSize: 9 },
  colNum: { width: "12%", fontSize: 9, textAlign: "right" },
  colBand: { width: "12%", fontSize: 9, textAlign: "center" },
});

function mark(
  band: SpmPdfScoresPayload["scales"][number]["band"],
  target: NonNullable<SpmPdfScoresPayload["scales"][number]["band"]>,
) {
  return band === target ? "X" : "";
}

export function SpmScoresDocument({
  payload,
}: {
  payload: SpmPdfScoresPayload;
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

        <View style={styles.tableHeader}>
          <Text style={styles.colCode}>Cód.</Text>
          <Text style={styles.colTitle}>Escala</Text>
          <Text style={styles.colNum}>Raw</Text>
          {payload.hasNorms ? (
            <>
              <Text style={styles.colNum}>T</Text>
              <Text style={styles.colBand}>Típ.</Text>
              <Text style={styles.colBand}>Alg.</Text>
              <Text style={styles.colBand}>Disf.</Text>
            </>
          ) : null}
        </View>

        {payload.scales.map((row) => (
          <View key={row.code} style={styles.row}>
            <Text style={styles.colCode}>{row.code}</Text>
            <Text style={styles.colTitle}>{row.title}</Text>
            <Text style={styles.colNum}>
              {row.raw}/{row.maxRaw}
            </Text>
            {payload.hasNorms ? (
              <>
                <Text style={styles.colNum}>
                  {row.code === "TAS" ? "—" : (row.tScore ?? "—")}
                </Text>
                <Text style={styles.colBand}>
                  {mark(row.band, "typical")}
                </Text>
                <Text style={styles.colBand}>
                  {mark(row.band, "some_problems")}
                </Text>
                <Text style={styles.colBand}>
                  {mark(row.band, "definite_dysfunction")}
                </Text>
              </>
            ) : null}
          </View>
        ))}

        {payload.hasNorms ? (
          <Text style={{ ...pdfStyles.patientLine, marginTop: 12 }}>
            {SPM_BAND_LABELS.typical}. {SPM_BAND_LABELS.some_problems}.{" "}
            {SPM_BAND_LABELS.definite_dysfunction}.
          </Text>
        ) : (
          <Text style={{ ...pdfStyles.patientLine, marginTop: 12 }}>
            Sem tabela normativa neste formulário — apenas escore bruto.
          </Text>
        )}
        <PageFooter />
      </Page>
    </Document>
  );
}
