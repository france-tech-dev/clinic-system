export type StudyCategory = {
  id: string;
  label: string;
  color: string;
};

export const STUDY_CATEGORIES: StudyCategory[] = [
  {
    "id": "modelos",
    "label": "Modelos Teóricos",
    "color": "#5B7B93"
  },
  {
    "id": "avaliacao",
    "label": "Avaliação e Escalas",
    "color": "#285C52"
  },
  {
    "id": "neuro",
    "label": "Neurologia",
    "color": "#7A6A9C"
  },
  {
    "id": "pediatria",
    "label": "Pediatria",
    "color": "#B8863B"
  },
  {
    "id": "saudemental",
    "label": "Saúde Mental",
    "color": "#A65D53"
  },
  {
    "id": "geral",
    "label": "Geral",
    "color": "#5C7A3E"
  }
] as const;

export function studyCategoryOf(id: string): StudyCategory {
  return (
    STUDY_CATEGORIES.find((c) => c.id === id) ??
    STUDY_CATEGORIES[STUDY_CATEGORIES.length - 1]
  );
}
