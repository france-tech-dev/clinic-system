export type ExerciseCategoryId =
  | "fina"
  | "grossa"
  | "cognicao"
  | "avd"
  | "sensorial"
  | "coordenacao"
  | "comunicacao"
  | "participacao";

export type ExerciseCategory = {
  id: ExerciseCategoryId;
  label: string;
  color: string;
};

export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  { id: "fina", label: "Motricidade Fina", color: "#5B7B93" },
  { id: "grossa", label: "Motricidade Grossa", color: "#B8863B" },
  { id: "cognicao", label: "Cognição", color: "#7A6A9C" },
  { id: "avd", label: "AVDs", color: "#285C52" },
  { id: "sensorial", label: "Sensorial", color: "#A65D53" },
  { id: "coordenacao", label: "Coordenação", color: "#5C7A3E" },
  { id: "comunicacao", label: "Comunicação", color: "#4A6FA5" },
  { id: "participacao", label: "Participação Social", color: "#A5764A" },
];

export const EXERCISE_LEVELS = ["Iniciante", "Intermediário", "Avançado"] as const;
export type ExerciseLevel = (typeof EXERCISE_LEVELS)[number];

export function categoryOf(id: string): ExerciseCategory {
  return EXERCISE_CATEGORIES.find((c) => c.id === id) ?? EXERCISE_CATEGORIES[0];
}
