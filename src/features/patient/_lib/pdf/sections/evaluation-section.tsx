import { Text, View } from "@react-pdf/renderer";
import type { EvaluationDTO } from "@/features/patient/patient.types";
import { categoryOf } from "@/shared/constants/exercise-categories";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";
import type { EvaluationReportOptions } from "../evaluation-report-options";
import type { EvaluationReportSectionId } from "../evaluation-report-options";
import {
  getEvaluationReportDomains,
  isEvaluationSectionEnabled,
} from "../evaluation-report-options";

function hasSectionContent(value: string): boolean {
  return value.trim().length > 0;
}

function showSection(
  options: EvaluationReportOptions | null,
  sectionId: EvaluationReportSectionId,
  value: string,
): boolean {
  return (
    isEvaluationSectionEnabled(options, sectionId) && hasSectionContent(value)
  );
}

function EvaluationBlock({
  evaluation,
  options,
}: {
  evaluation: EvaluationDTO;
  options: EvaluationReportOptions | null;
}) {
  const domains = getEvaluationReportDomains(evaluation, options);

  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>
        Avaliação {evaluation.tipo} — {formatDateBR(evaluation.date)}
      </Text>
      {showSection(options, "diagnostico", evaluation.diagnostico) ? (
        <Text style={pdfStyles.paragraph}>
          Diagnóstico: {evaluation.diagnostico}
        </Text>
      ) : null}
      {showSection(options, "encaminhadoPor", evaluation.encaminhadoPor) ? (
        <Text style={pdfStyles.paragraph}>
          Encaminhado por: {evaluation.encaminhadoPor}
        </Text>
      ) : null}
      {showSection(options, "queixa", evaluation.queixa) ? (
        <Text style={pdfStyles.paragraph}>Queixa: {evaluation.queixa}</Text>
      ) : null}
      {showSection(options, "historia", evaluation.historia) ? (
        <Text style={pdfStyles.paragraph}>História: {evaluation.historia}</Text>
      ) : null}
      {showSection(options, "contextoFamiliar", evaluation.contextoFamiliar) ? (
        <Text style={pdfStyles.paragraph}>
          Contexto familiar: {evaluation.contextoFamiliar}
        </Text>
      ) : null}
      {showSection(options, "nivelPrevio", evaluation.nivelPrevio) ? (
        <Text style={pdfStyles.paragraph}>
          Nível prévio: {evaluation.nivelPrevio}
        </Text>
      ) : null}
      {showSection(options, "medicacoes", evaluation.medicacoes) ? (
        <Text style={pdfStyles.paragraph}>
          Medicações: {evaluation.medicacoes}
        </Text>
      ) : null}
      {showSection(options, "precaucoes", evaluation.precaucoes) ? (
        <Text style={pdfStyles.paragraph}>
          Precauções: {evaluation.precaucoes}
        </Text>
      ) : null}
      {showSection(options, "equipamentos", evaluation.equipamentos) ? (
        <Text style={pdfStyles.paragraph}>
          Equipamentos: {evaluation.equipamentos}
        </Text>
      ) : null}
      {domains.map((domain) => (
        <Text key={domain.categoryId} style={pdfStyles.bulletItem}>
          • {categoryOf(domain.categoryId).label}: {domain.score}/4
          {domain.note ? ` — ${domain.note}` : ""}
        </Text>
      ))}
      {showSection(options, "objetivos", evaluation.objetivos) ? (
        <Text style={pdfStyles.paragraph}>
          Objetivos: {evaluation.objetivos}
        </Text>
      ) : null}
      {showSection(options, "condutas", evaluation.condutas) ? (
        <Text style={pdfStyles.paragraph}>
          Condutas: {evaluation.condutas}
        </Text>
      ) : null}
      {showSection(options, "frequencia", evaluation.frequencia) ? (
        <Text style={pdfStyles.paragraph}>Frequência: {evaluation.frequencia}</Text>
      ) : null}
      {showSection(options, "criteriosAlta", evaluation.criteriosAlta) ? (
        <Text style={pdfStyles.paragraph}>
          Critérios de alta: {evaluation.criteriosAlta}
        </Text>
      ) : null}
    </View>
  );
}

type EvaluationSectionProps = {
  evaluations: EvaluationDTO[];
  selectedEvaluation: EvaluationDTO | null;
  single?: boolean;
  evaluationReportOptions?: EvaluationReportOptions | null;
};

export function EvaluationSection({
  evaluations,
  selectedEvaluation,
  single = false,
  evaluationReportOptions = null,
}: EvaluationSectionProps) {
  const items = single
    ? selectedEvaluation
      ? [selectedEvaluation]
      : []
    : evaluations;

  const options = single ? evaluationReportOptions : null;

  return (
    <>
      {items.map((evaluation) => (
        <EvaluationBlock
          key={evaluation.id}
          evaluation={evaluation}
          options={options}
        />
      ))}
    </>
  );
}
