import type { AssessmentDTO } from "@/domains/assessment/assessment.types";

export type AssessmentReportSectionId =
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

export type AssessmentReportOptions = {
  sections: Record<AssessmentReportSectionId, boolean>;
  domainIds: string[];
};

export function isAssessmentSectionEnabled(
  options: AssessmentReportOptions | null | undefined,
  sectionId: AssessmentReportSectionId,
): boolean {
  if (!options) return true;
  return options.sections[sectionId];
}

export function getAssessmentReportDomains(
  assessment: AssessmentDTO,
  options: AssessmentReportOptions | null | undefined,
) {
  if (!options) return assessment.domains;
  return assessment.domains.filter((domain) =>
    options.domainIds.includes(domain.categoryId),
  );
}
