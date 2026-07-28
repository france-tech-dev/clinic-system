import type { ClinicalEvaluationDTO } from "@/features/patient/patient.types";
import { CLINICAL_EVALUATION_DOMAINS } from "@/shared/constants/clinical-evaluation-domains";

export type ClinicalEvaluationReportSectionId =
  | "diagnosis"
  | "referredBy"
  | "complaint"
  | "history"
  | "familyContext"
  | "previousLevel"
  | "medications"
  | "precautions"
  | "equipment"
  | "goals"
  | "interventions"
  | "frequency"
  | "dischargeCriteria";

export type ClinicalEvaluationReportOptions = {
  sections: Record<ClinicalEvaluationReportSectionId, boolean>;
  domainIds: string[];
};

export const CLINICAL_EVALUATION_REPORT_SECTIONS: {
  id: ClinicalEvaluationReportSectionId;
  label: string;
}[] = [
  { id: "diagnosis", label: "Diagnóstico" },
  { id: "referredBy", label: "Encaminhado por" },
  { id: "complaint", label: "Queixa" },
  { id: "history", label: "História" },
  { id: "familyContext", label: "Contexto familiar" },
  { id: "previousLevel", label: "Nível prévio" },
  { id: "medications", label: "Medicações" },
  { id: "precautions", label: "Precauções" },
  { id: "equipment", label: "Equipamentos" },
  { id: "goals", label: "Objetivos" },
  { id: "interventions", label: "Condutas" },
  { id: "frequency", label: "Frequência" },
  { id: "dischargeCriteria", label: "Critérios de alta" },
];

export function buildDefaultClinicalEvaluationReportOptions(
  evaluation?: ClinicalEvaluationDTO | null,
): ClinicalEvaluationReportOptions {
  const sections = Object.fromEntries(
    CLINICAL_EVALUATION_REPORT_SECTIONS.map((section) => [section.id, true]),
  ) as Record<ClinicalEvaluationReportSectionId, boolean>;

  const domainIds =
    evaluation?.domains.map((domain) => domain.categoryId) ??
    CLINICAL_EVALUATION_DOMAINS.map((category) => category.id);

  return { sections, domainIds };
}

export function isClinicalClinicalEvaluationSectionEnabled(
  options: ClinicalEvaluationReportOptions | null | undefined,
  sectionId: ClinicalEvaluationReportSectionId,
): boolean {
  if (!options) return true;
  return options.sections[sectionId];
}

export function getClinicalEvaluationReportDomains(
  evaluation: ClinicalEvaluationDTO,
  options: ClinicalEvaluationReportOptions | null | undefined,
) {
  if (!options) return evaluation.domains;
  return evaluation.domains.filter((domain) =>
    options.domainIds.includes(domain.categoryId),
  );
}

export function hasEvaluationReportContent(
  options: ClinicalEvaluationReportOptions,
): boolean {
  const hasSection = Object.values(options.sections).some(Boolean);
  return hasSection || options.domainIds.length > 0;
}

export function setClinicalEvaluationSection(
  options: ClinicalEvaluationReportOptions,
  sectionId: ClinicalEvaluationReportSectionId,
  enabled: boolean,
): ClinicalEvaluationReportOptions {
  return {
    ...options,
    sections: { ...options.sections, [sectionId]: enabled },
  };
}

export function setClinicalEvaluationDomain(
  options: ClinicalEvaluationReportOptions,
  domainId: string,
  enabled: boolean,
): ClinicalEvaluationReportOptions {
  const domainIds = enabled
    ? [...new Set([...options.domainIds, domainId])]
    : options.domainIds.filter((id) => id !== domainId);

  return { ...options, domainIds };
}

export function setAllClinicalEvaluationSections(
  options: ClinicalEvaluationReportOptions,
  enabled: boolean,
): ClinicalEvaluationReportOptions {
  return {
    ...options,
    sections: Object.fromEntries(
      CLINICAL_EVALUATION_REPORT_SECTIONS.map((section) => [section.id, enabled]),
    ) as Record<ClinicalEvaluationReportSectionId, boolean>,
  };
}

export function setAllClinicalEvaluationDomains(
  options: ClinicalEvaluationReportOptions,
  evaluation: ClinicalEvaluationDTO,
  enabled: boolean,
): ClinicalEvaluationReportOptions {
  return {
    ...options,
    domainIds: enabled
      ? evaluation.domains.map((domain) => domain.categoryId)
      : [],
  };
}
