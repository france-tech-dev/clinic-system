import type { PatientReportEvolution } from "@/application/patient";
import { formatTime } from "@/shared/constants/appointment";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import { Text, View } from "@react-pdf/renderer";

type EvolutionsSectionProps = {
  evolutions: PatientReportEvolution[];
};

export function EvolutionsSection({ evolutions }: EvolutionsSectionProps) {
  return (
    <>
      <Text style={pdfStyles.sectionTitle}>Evoluções</Text>
      {evolutions.map((note) => (
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
