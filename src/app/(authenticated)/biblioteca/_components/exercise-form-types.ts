import {
  EXERCISE_CATEGORIES,
  EXERCISE_LEVELS,
} from "@/shared/constants/exercise-categories";

export type ExerciseFormState = {
  title: string;
  categoryId: string;
  objective: string;
  materials: string;
  instructions: string;
  duration: string;
  level: string;
};

export function emptyExerciseForm(): ExerciseFormState {
  return {
    title: "",
    categoryId: EXERCISE_CATEGORIES[0].id,
    objective: "",
    materials: "",
    instructions: "",
    duration: "",
    level: EXERCISE_LEVELS[0],
  };
}
