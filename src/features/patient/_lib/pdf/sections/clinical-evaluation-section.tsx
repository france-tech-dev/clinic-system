import { Text, View } from "@react-pdf/renderer";
import type { ClinicalEvaluationDTO } from "@/features/patient/patient.types";
import { categoryOf } from "@/shared/constants/clinical-evaluation-domains";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import type { ClinicalEvaluationReportOptions } from "../clinical-evaluation-report-options";
import type { ClinicalEvaluationReportSectionId } from "../clinical-evaluation-report-options";
import {
  getClinicalEvaluationReportDomains,
  isClinicalEvaluationSectionEnabled,
} from "../clinical-evaluation-report-options";

function hasSectionContent(value: string): boolean {
  return value.trim().length > 0;
}

function showSection(
  options: ClinicalEvaluationReportOptions | null,
  sectionId: ClinicalEvaluationReportSectionId,
  value: string,
): boolean {
  return (
    isClinicalEvaluationSectionEnabled(options, sectionId) &&
    hasSectionContent(value)
  );
}

function ClinicalEvaluationBlock({
  evaluation,
  options,
}: {
  evaluation: ClinicalEvaluationDTO;
  options: ClinicalEvaluationReportOptions | null;
}) {
  const domains = getClinicalEvaluationReportDomains(evaluation, options);

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>
        Avaliação {evaluation.type} — {formatDateBR(evaluation.date)}
      </Text>
      {showSection(options, "diagnosis", evaluation.diagnosis) ? (
        <Text style={pdfStyles.paragraph}>
          Diagnóstico: {evaluation.diagnosis}
        </Text>
      ) : null}
      {showSection(options, "referredBy", evaluation.referredBy) ? (
        <Text style={pdfStyles.paragraph}>
          Encaminhado por: {evaluation.referredBy}
        </Text>
      ) : null}
      {showSection(options, "complaint", evaluation.complaint) ? (
        <Text style={pdfStyles.paragraph}>Queixa: {evaluation.complaint}</Text>
      ) : null}
      {showSection(options, "history", evaluation.history) ? (
        <Text style={pdfStyles.paragraph}>História: {evaluation.history}</Text>
      ) : null}
      {showSection(options, "familyContext", evaluation.familyContext) ? (
        <Text style={pdfStyles.paragraph}>
          Contexto familiar: {evaluation.familyContext}
        </Text>
      ) : null}
      {showSection(options, "previousLevel", evaluation.previousLevel) ? (
        <Text style={pdfStyles.paragraph}>
          Nível prévio: {evaluation.previousLevel}
        </Text>
      ) : null}
      {showSection(options, "medications", evaluation.medications) ? (
        <Text style={pdfStyles.paragraph}>
          Medicações: {evaluation.medications}
        </Text>
      ) : null}
      {showSection(options, "precautions", evaluation.precautions) ? (
        <Text style={pdfStyles.paragraph}>
          Precauções: {evaluation.precautions}
        </Text>
      ) : null}
      {showSection(options, "equipment", evaluation.equipment) ? (
        <Text style={pdfStyles.paragraph}>
          Equipamentos: {evaluation.equipment}
        </Text>
      ) : null}
      {domains.map((domain) => (
        <Text key={domain.categoryId} style={pdfStyles.bulletItem}>
          • {categoryOf(domain.categoryId).label}: {domain.score}/4
          {domain.note ? ` — ${domain.note}` : ""}
        </Text>
      ))}
      {showSection(options, "goals", evaluation.goals) ? (
        <Text style={pdfStyles.paragraph}>
          Objetivos: {evaluation.goals}
        </Text>
      ) : null}
      {showSection(options, "interventions", evaluation.interventions) ? (
        <Text style={pdfStyles.paragraph}>
          Condutas: {evaluation.interventions}
        </Text>
      ) : null}
      {showSection(options, "frequency", evaluation.frequency) ? (
        <Text style={pdfStyles.paragraph}>Frequência: {evaluation.frequency}</Text>
      ) : null}
      {showSection(options, "dischargeCriteria", evaluation.dischargeCriteria) ? (
        <Text style={pdfStyles.paragraph}>
          Critérios de alta: {evaluation.dischargeCriteria}
        </Text>
      ) : null}
    </View>
  );
}

type ClinicalEvaluationSectionProps = {
  clinicalEvaluations: ClinicalEvaluationDTO[];
  selectedEvaluation: ClinicalEvaluationDTO | null;
  single?: boolean;
  evaluationReportOptions?: ClinicalEvaluationReportOptions | null;
};

export function ClinicalEvaluationSection({
  clinicalEvaluations,
  selectedEvaluation,
  single = false,
  evaluationReportOptions = null,
}: ClinicalEvaluationSectionProps) {
  const items = single
    ? selectedEvaluation
      ? [selectedEvaluation]
      : []
    : clinicalEvaluations;

  const options = single ? evaluationReportOptions : null;

  return (
    <>
      {items.map((evaluation) => (
        <ClinicalEvaluationBlock
          key={evaluation.id}
          evaluation={evaluation}
          options={options}
        />
      ))}
    </>
  );
}
