import { Document, Page, Text, View } from "@react-pdf/renderer";
import { PageFooter } from "@/shared/lib/pdf/components/page-footer";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import type { SpmPdfResponsesPayload } from "@/domains/protocol/_lib/pdf/types";

export function SpmResponsesDocument({
  payload,
}: {
  payload: SpmPdfResponsesPayload;
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
          N — Nunca · O — Ocasionalmente · F — Frequentemente · S — Sempre
        </Text>

        {payload.sections.map((section) => (
          <View key={section.title}>
            <Text style={pdfStyles.subsectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <Text
                key={`${section.title}-${item.number}`}
                style={pdfStyles.bulletItem}
              >
                {item.number}. {item.label} — {item.value}
              </Text>
            ))}
          </View>
        ))}
        <PageFooter />
      </Page>
    </Document>
  );
}
