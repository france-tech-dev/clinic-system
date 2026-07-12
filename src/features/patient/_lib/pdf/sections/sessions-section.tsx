import { Text, View } from "@react-pdf/renderer";
import type { PatientReportSessionNote } from "../types";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";

type SessionsSectionProps = {
  sessionNotes: PatientReportSessionNote[];
};

export function SessionsSection({ sessionNotes }: SessionsSectionProps) {
  return (
    <>
      <Text style={pdfStyles.sectionTitle}>Evoluções</Text>
      {sessionNotes.map((note) => (
        <View key={`${note.date}-${note.status}`}>
          <Text style={pdfStyles.subsectionTitle}>
            {formatDateBR(note.date)} — {note.status}
          </Text>
          <Text style={pdfStyles.paragraph}>{note.atividades}</Text>
          {note.observacoes ? (
            <Text style={pdfStyles.paragraph}>{note.observacoes}</Text>
          ) : null}
        </View>
      ))}
    </>
  );
}
