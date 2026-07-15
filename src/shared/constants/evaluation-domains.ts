export type EvaluationDomainId =
  | "fina"
  | "grossa"
  | "cognicao"
  | "avd"
  | "sensorial"
  | "coordenacao"
  | "comunicacao"
  | "participacao";

export type EvaluationDomainCategory = {
  id: EvaluationDomainId;
  label: string;
  color: string;
};

export const EVALUATION_DOMAINS: EvaluationDomainCategory[] = [
  { id: "fina", label: "Motricidade Fina", color: "#5B7B93" },
  { id: "grossa", label: "Motricidade Grossa", color: "#B8863B" },
  { id: "cognicao", label: "Cognição", color: "#7A6A9C" },
  { id: "avd", label: "AVDs", color: "#285C52" },
  { id: "sensorial", label: "Sensorial", color: "#A65D53" },
  { id: "coordenacao", label: "Coordenação", color: "#5C7A3E" },
  { id: "comunicacao", label: "Comunicação", color: "#4A6FA5" },
  { id: "participacao", label: "Participação Social", color: "#A5764A" },
];

export function categoryOf(id: string): EvaluationDomainCategory {
  return EVALUATION_DOMAINS.find((c) => c.id === id) ?? EVALUATION_DOMAINS[0];
}
