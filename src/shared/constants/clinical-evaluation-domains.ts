export type ClinicalClinicalEvaluationDomainId =
  | "fine-motor"
  | "gross-motor"
  | "cognition"
  | "adl"
  | "sensory"
  | "coordination"
  | "communication"
  | "participation";

export type ClinicalClinicalEvaluationDomainCategory = {
  id: ClinicalClinicalEvaluationDomainId;
  label: string;
  color: string;
};

export const CLINICAL_EVALUATION_DOMAINS: ClinicalClinicalEvaluationDomainCategory[] = [
  { id: "fine-motor", label: "Motricidade Fina", color: "#5B7B93" },
  { id: "gross-motor", label: "Motricidade Grossa", color: "#B8863B" },
  { id: "cognition", label: "Cognição", color: "#7A6A9C" },
  { id: "adl", label: "AVDs", color: "#285C52" },
  { id: "sensory", label: "Sensorial", color: "#A65D53" },
  { id: "coordination", label: "Coordenação", color: "#5C7A3E" },
  { id: "communication", label: "Comunicação", color: "#4A6FA5" },
  { id: "participation", label: "Participação Social", color: "#A5764A" },
];

export function categoryOf(id: string): ClinicalClinicalEvaluationDomainCategory {
  return CLINICAL_EVALUATION_DOMAINS.find((c) => c.id === id) ?? CLINICAL_EVALUATION_DOMAINS[0];
}
