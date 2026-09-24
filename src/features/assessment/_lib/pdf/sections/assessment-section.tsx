import { Text, View } from "@react-pdf/renderer";
import type { AssessmentDTO } from "@/domains/assessment/assessment.types";
import { categoryOf } from "@/shared/constants/assessment-domains";
import { formatDateBR } from "@/shared/lib/date/format-date-br";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import type {
  AssessmentReportOptions,
  AssessmentReportSectionId,
} from "@/domains/assessment/_lib/pdf/assessment-report-options";
import {
  getAssessmentReportDomains,
  isAssessmentSectionEnabled,
} from "@/domains/assessment/_lib/pdf/assessment-report-options";

function hasSectionContent(value: string): boolean {
  return value.trim().length > 0;
}

function showSection(
  options: AssessmentReportOptions | null,
  sectionId: AssessmentReportSectionId,
  value: string,
): boolean {
  return (
    isAssessmentSectionEnabled(options, sectionId) &&
    hasSectionContent(value)
  );
}

function AssessmentBlock({
  assessment,
  options,
}: {
  assessment: AssessmentDTO;
  options: AssessmentReportOptions | null;
}) {
  const domains = getAssessmentReportDomains(assessment, options);

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>
        Avaliação {assessment.type} — {formatDateBR(assessment.date)}
      </Text>
      {showSection(options, "diagnosis", assessment.diagnosis) ? (
        <Text style={pdfStyles.paragraph}>
          Diagnóstico: {assessment.diagnosis}
        </Text>
      ) : null}
      {showSection(options, "referredBy", assessment.referredBy) ? (
        <Text style={pdfStyles.paragraph}>
          Encaminhado por: {assessment.referredBy}
        </Text>
      ) : null}
      {showSection(options, "complaint", assessment.complaint) ? (
        <Text style={pdfStyles.paragraph}>Queixa: {assessment.complaint}</Text>
      ) : null}
      {showSection(options, "history", assessment.history) ? (
        <Text style={pdfStyles.paragraph}>História: {assessment.history}</Text>
      ) : null}
      {showSection(options, "familyContext", assessment.familyContext) ? (
        <Text style={pdfStyles.paragraph}>
          Contexto familiar: {assessment.familyContext}
        </Text>
      ) : null}
      {showSection(options, "previousLevel", assessment.previousLevel) ? (
        <Text style={pdfStyles.paragraph}>
          Nível prévio: {assessment.previousLevel}
        </Text>
      ) : null}
      {showSection(options, "medications", assessment.medications) ? (
        <Text style={pdfStyles.paragraph}>
          Medicações: {assessment.medications}
        </Text>
      ) : null}
      {showSection(options, "precautions", assessment.precautions) ? (
        <Text style={pdfStyles.paragraph}>
          Precauções: {assessment.precautions}
        </Text>
      ) : null}
      {showSection(options, "equipment", assessment.equipment) ? (
        <Text style={pdfStyles.paragraph}>
          Equipamentos: {assessment.equipment}
        </Text>
      ) : null}
      {domains.map((domain) => (
        <Text key={domain.categoryId} style={pdfStyles.bulletItem}>
          • {categoryOf(domain.categoryId).label}: {domain.score}/4
          {domain.note ? ` — ${domain.note}` : ""}
        </Text>
      ))}
      {showSection(options, "goals", assessment.goals) ? (
        <Text style={pdfStyles.paragraph}>
          Objetivos: {assessment.goals}
        </Text>
      ) : null}
      {showSection(options, "interventions", assessment.interventions) ? (
        <Text style={pdfStyles.paragraph}>
          Condutas: {assessment.interventions}
        </Text>
      ) : null}
      {showSection(options, "frequency", assessment.frequency) ? (
        <Text style={pdfStyles.paragraph}>Frequência: {assessment.frequency}</Text>
      ) : null}
      {showSection(options, "dischargeCriteria", assessment.dischargeCriteria) ? (
        <Text style={pdfStyles.paragraph}>
          Critérios de alta: {assessment.dischargeCriteria}
        </Text>
      ) : null}
    </View>
  );
}

type AssessmentSectionProps = {
  assessments: AssessmentDTO[];
  selectedAssessment: AssessmentDTO | null;
  single?: boolean;
  assessmentReportOptions?: AssessmentReportOptions | null;
};

export function AssessmentSection({
  assessments,
  selectedAssessment,
  single = false,
  assessmentReportOptions = null,
}: AssessmentSectionProps) {
  const items = single
    ? selectedAssessment
      ? [selectedAssessment]
      : []
    : assessments;

  const options = single ? assessmentReportOptions : null;

  return (
    <>
      {items.map((assessment) => (
        <AssessmentBlock
          key={assessment.id}
          assessment={assessment}
          options={options}
        />
      ))}
    </>
  );
}
