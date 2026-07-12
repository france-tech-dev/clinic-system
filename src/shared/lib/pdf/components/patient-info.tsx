import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "../styles/shared";

type PatientInfoProps = {
  patientName: string;
};

export function PatientInfo({ patientName }: PatientInfoProps) {
  return (
    <Text style={pdfStyles.patientLine}>
      Paciente: <Text style={pdfStyles.patientName}>{patientName}</Text>
    </Text>
  );
}
