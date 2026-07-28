import { Text, View } from "@react-pdf/renderer";
import type { PatientReportSessionNote } from "../types";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { formatTime } from "@/shared/constants/appointment";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";

type SessionsSectionProps = {
  sessionNotes: PatientReportSessionNote[];
};

export function SessionsSection({ sessionNotes }: SessionsSectionProps) {
  return (
    <>
      <Text style={pdfStyles.sectionTitle}>Evoluções</Text>
      {sessionNotes.map((note) => (
        <View key={`${note.date}-${note.time}-${note.status}`}>
          <Text style={pdfStyles.subsectionTitle}>
            {formatDateBR(note.date)}
            {note.time ? ` às ${formatTime(note.time)}` : ""} — {note.status}
          </Text>
          <Text style={pdfStyles.paragraph}>{note.activities}</Text>
          {note.observations ? (
            <Text style={pdfStyles.paragraph}>{note.observations}</Text>
          ) : null}
        </View>
      ))}
    </>
  );
}
