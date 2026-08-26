import type { ClinicalEvaluationDTO } from "@/domains/patient/patient.types";

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

export function isClinicalEvaluationSectionEnabled(
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
