import type { EvaluationDTO } from "@/features/patient/patient.types";
import { EVALUATION_DOMAINS } from "@/shared/constants/evaluation-domains";

export type EvaluationReportSectionId =
  | "diagnostico"
  | "encaminhadoPor"
  | "queixa"
  | "historia"
  | "contextoFamiliar"
  | "nivelPrevio"
  | "medicacoes"
  | "precaucoes"
  | "equipamentos"
  | "objetivos"
  | "condutas"
  | "frequencia"
  | "criteriosAlta";

export type EvaluationReportOptions = {
  sections: Record<EvaluationReportSectionId, boolean>;
  domainIds: string[];
};

export const EVALUATION_REPORT_SECTIONS: {
  id: EvaluationReportSectionId;
  label: string;
}[] = [
  { id: "diagnostico", label: "Diagnóstico" },
  { id: "encaminhadoPor", label: "Encaminhado por" },
  { id: "queixa", label: "Queixa" },
  { id: "historia", label: "História" },
  { id: "contextoFamiliar", label: "Contexto familiar" },
  { id: "nivelPrevio", label: "Nível prévio" },
  { id: "medicacoes", label: "Medicações" },
  { id: "precaucoes", label: "Precauções" },
  { id: "equipamentos", label: "Equipamentos" },
  { id: "objetivos", label: "Objetivos" },
  { id: "condutas", label: "Condutas" },
  { id: "frequencia", label: "Frequência" },
  { id: "criteriosAlta", label: "Critérios de alta" },
];

export function buildDefaultEvaluationReportOptions(
  evaluation?: EvaluationDTO | null,
): EvaluationReportOptions {
  const sections = Object.fromEntries(
    EVALUATION_REPORT_SECTIONS.map((section) => [section.id, true]),
  ) as Record<EvaluationReportSectionId, boolean>;

  const domainIds =
    evaluation?.domains.map((domain) => domain.categoryId) ??
    EVALUATION_DOMAINS.map((category) => category.id);

  return { sections, domainIds };
}

export function isEvaluationSectionEnabled(
  options: EvaluationReportOptions | null | undefined,
  sectionId: EvaluationReportSectionId,
): boolean {
  if (!options) return true;
  return options.sections[sectionId];
}

export function getEvaluationReportDomains(
  evaluation: EvaluationDTO,
  options: EvaluationReportOptions | null | undefined,
) {
  if (!options) return evaluation.domains;
  return evaluation.domains.filter((domain) =>
    options.domainIds.includes(domain.categoryId),
  );
}

export function hasEvaluationReportContent(
  options: EvaluationReportOptions,
): boolean {
  const hasSection = Object.values(options.sections).some(Boolean);
  return hasSection || options.domainIds.length > 0;
}

export function setEvaluationSection(
  options: EvaluationReportOptions,
  sectionId: EvaluationReportSectionId,
  enabled: boolean,
): EvaluationReportOptions {
  return {
    ...options,
    sections: { ...options.sections, [sectionId]: enabled },
  };
}

export function setEvaluationDomain(
  options: EvaluationReportOptions,
  domainId: string,
  enabled: boolean,
): EvaluationReportOptions {
  const domainIds = enabled
    ? [...new Set([...options.domainIds, domainId])]
    : options.domainIds.filter((id) => id !== domainId);

  return { ...options, domainIds };
}

export function setAllEvaluationSections(
  options: EvaluationReportOptions,
  enabled: boolean,
): EvaluationReportOptions {
  return {
    ...options,
    sections: Object.fromEntries(
      EVALUATION_REPORT_SECTIONS.map((section) => [section.id, enabled]),
    ) as Record<EvaluationReportSectionId, boolean>,
  };
}

export function setAllEvaluationDomains(
  options: EvaluationReportOptions,
  evaluation: EvaluationDTO,
  enabled: boolean,
): EvaluationReportOptions {
  return {
    ...options,
    domainIds: enabled
      ? evaluation.domains.map((domain) => domain.categoryId)
      : [],
  };
}
