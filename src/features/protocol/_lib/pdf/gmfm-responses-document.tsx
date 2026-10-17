import { Document, Page, Text, View } from "@react-pdf/renderer";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import type { GmfmPdfResponsesPayload } from "@/domains/protocol/_lib/pdf/types";

export function GmfmResponsesDocument({
  payload,
}: {
  payload: GmfmPdfResponsesPayload;
}) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page} wrap>
        <Text style={pdfStyles.clinicName}>{payload.protocolName}</Text>
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
        <Text style={{ ...pdfStyles.patientLine, ...pdfStyles.muted }}>
          Pontuação por item: 0 (não inicia) a 3 (completa)
        </Text>

        {payload.domains.map((domain) => (
          <View key={domain.title}>
            <Text style={pdfStyles.subsectionTitle}>{domain.title}</Text>
            {domain.items.map((item) => (
              <Text key={item.id} style={pdfStyles.bulletItem}>
                {item.id}. {item.label} — {item.value}
              </Text>
            ))}
          </View>
        ))}
        <PageFooter />
      </Page>
    </Document>
  );
}
