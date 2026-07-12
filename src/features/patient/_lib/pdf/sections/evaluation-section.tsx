import { Text, View } from "@react-pdf/renderer";
import type { EvaluationDTO } from "@/features/patient/patient.types";
import { categoryOf } from "@/shared/constants/exercise-categories";
import { formatDateBR } from "@/shared/lib/format-date-br";
import { pdfStyles } from "@/shared/lib/pdf/styles/shared";

function EvaluationBlock({ evaluation }: { evaluation: EvaluationDTO }) {
  return (
    <View>
      <Text style={pdfStyles.sectionTitle}>
        Avaliação {evaluation.tipo} — {formatDateBR(evaluation.date)}
      </Text>
      {evaluation.diagnostico ? (
        <Text style={pdfStyles.paragraph}>
          Diagnóstico: {evaluation.diagnostico}
        </Text>
      ) : null}
      {evaluation.encaminhadoPor ? (
        <Text style={pdfStyles.paragraph}>
          Encaminhado por: {evaluation.encaminhadoPor}
        </Text>
      ) : null}
      <Text style={pdfStyles.paragraph}>Queixa: {evaluation.queixa || "—"}</Text>
      <Text style={pdfStyles.paragraph}>História: {evaluation.historia || "—"}</Text>
      {evaluation.contextoFamiliar ? (
        <Text style={pdfStyles.paragraph}>
          Contexto familiar: {evaluation.contextoFamiliar}
        </Text>
      ) : null}
      {evaluation.domains.map((d) => (
        <Text key={d.categoryId} style={pdfStyles.bulletItem}>
          • {categoryOf(d.categoryId).label}: {d.score}/4
          {d.note ? ` — ${d.note}` : ""}
        </Text>
      ))}
      <Text style={pdfStyles.paragraph}>
        Objetivos: {evaluation.objetivos || "—"}
      </Text>
      <Text style={pdfStyles.paragraph}>
        Condutas: {evaluation.condutas || "—"}
      </Text>
      {evaluation.frequencia ? (
        <Text style={pdfStyles.paragraph}>Frequência: {evaluation.frequencia}</Text>
      ) : null}
      {evaluation.criteriosAlta ? (
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
};

export function EvaluationSection({
  evaluations,
  selectedEvaluation,
  single = false,
}: EvaluationSectionProps) {
  const items = single
    ? selectedEvaluation
      ? [selectedEvaluation]
      : []
    : evaluations;

  return (
    <>
      {items.map((evaluation) => (
        <EvaluationBlock key={evaluation.id} evaluation={evaluation} />
      ))}
    </>
  );
}
