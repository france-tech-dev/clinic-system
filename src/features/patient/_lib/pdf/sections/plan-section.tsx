import { Text } from "@react-pdf/renderer";
import type { PatientReportPlanItem } from "../types";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";

type PlanSectionProps = {
  planItems: PatientReportPlanItem[];
};

export function PlanSection({ planItems }: PlanSectionProps) {
  return (
    <>
      <Text style={pdfStyles.sectionTitle}>Plano</Text>
      {planItems.map((item, index) => (
        <Text key={`${item.exerciseTitle}-${index}`} style={pdfStyles.bulletItem}>
          • {item.exerciseTitle} — {item.objective}
        </Text>
      ))}
    </>
  );
}
